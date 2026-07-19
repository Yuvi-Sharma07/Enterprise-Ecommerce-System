package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.dto.ProductDTO;
import com.enterprise.ecommerce.dto.ProductSearchCriteria;
import com.enterprise.ecommerce.model.Brand;
import com.enterprise.ecommerce.model.Category;
import com.enterprise.ecommerce.model.Inventory;
import com.enterprise.ecommerce.model.Product;
import com.enterprise.ecommerce.repository.BrandRepository;
import com.enterprise.ecommerce.repository.CategoryRepository;
import com.enterprise.ecommerce.repository.InventoryRepository;
import com.enterprise.ecommerce.repository.ProductRepository;
import com.enterprise.ecommerce.repository.ProductSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired(required = false)
    private StringRedisTemplate redisTemplate;

    // --- PRODUCT CRUD ---

    @Transactional(readOnly = true)
    public Page<ProductDTO> searchProducts(ProductSearchCriteria criteria, Pageable pageable) {
        Specification<Product> spec = ProductSpecification.filterByCriteria(criteria);
        Page<Product> products = productRepository.findAll(spec, pageable);
        return products.map(this::convertToDTO);
    }

    @Cacheable(value = "products", key = "#id")
    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        // Increment Frequently Viewed Products in Redis Sorted Set
        try {
            if (redisTemplate != null) {
                redisTemplate.opsForZSet().incrementScore("frequently_viewed_products", id.toString(), 1);
            }
        } catch (Exception e) {
            System.err.println("Redis connection failed during view count increment: " + e.getMessage());
        }

        return convertToDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        if (productRepository.existsBySku(dto.getSku())) {
            throw new IllegalArgumentException("SKU is already in use: " + dto.getSku());
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + dto.getCategoryId()));

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new IllegalArgumentException("Brand not found with id: " + dto.getBrandId()));

        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .sku(dto.getSku())
                .barcode(dto.getBarcode() != null ? dto.getBarcode() : UUID.randomUUID().toString())
                .imageUrl(dto.getImageUrl())
                .category(category)
                .brand(brand)
                .active(dto.isActive())
                .build();

        Product savedProduct = productRepository.save(product);

        // Auto-initialize inventory for new product
        Inventory inventory = Inventory.builder()
                .product(savedProduct)
                .currentStock(dto.getStockLevel() != null ? dto.getStockLevel() : 0)
                .reservedStock(0)
                .lowStockThreshold(10)
                .build();
        inventoryRepository.save(inventory);

        return convertToDTO(savedProduct);
    }

    @CacheEvict(value = "products", key = "#id")
    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        if (!product.getSku().equals(dto.getSku()) && productRepository.existsBySku(dto.getSku())) {
            throw new IllegalArgumentException("SKU is already in use: " + dto.getSku());
        }

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + dto.getCategoryId()));

        Brand brand = brandRepository.findById(dto.getBrandId())
                .orElseThrow(() -> new IllegalArgumentException("Brand not found with id: " + dto.getBrandId()));

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setSku(dto.getSku());
        product.setBarcode(dto.getBarcode());
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(category);
        product.setBrand(brand);
        product.setActive(dto.isActive());

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @CacheEvict(value = "products", key = "#id")
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        
        // Logical delete or physical delete based on design preference
        product.setActive(false);
        productRepository.save(product);
    }

    // --- FREQUENTLY VIEWED PRODUCTS ---

    public List<ProductDTO> getFrequentlyViewedProducts(int limit) {
        try {
            if (redisTemplate != null) {
                Set<String> productIds = redisTemplate.opsForZSet().reverseRange("frequently_viewed_products", 0, limit - 1);
                if (productIds != null && !productIds.isEmpty()) {
                    List<Long> ids = productIds.stream().map(Long::parseLong).collect(Collectors.toList());
                    List<Product> products = productRepository.findAllById(ids);
                    Map<Long, Product> productMap = products.stream().collect(Collectors.toMap(Product::getId, p -> p));
                    return ids.stream()
                            .map(productMap::get)
                            .filter(Objects::nonNull)
                            .map(this::convertToDTO)
                            .collect(Collectors.toList());
                }
            }
        } catch (Exception e) {
            System.err.println("Redis connection unavailable for frequently viewed items, reverting to defaults: " + e.getMessage());
        }
        // Fallback: return top active products
        Page<Product> defaultProducts = productRepository.findByActiveTrue(PageRequest.of(0, limit, Sort.by("id").descending()));
        return defaultProducts.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // --- CATEGORIES ---

    @Cacheable(value = "categories")
    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @CacheEvict(value = "categories", allEntries = true)
    @Transactional
    public Category createCategory(Category category) {
        if (category.getSlug() == null || category.getSlug().trim().isEmpty()) {
            category.setSlug(category.getName().toLowerCase().replaceAll("[^a-z0-9]", "-"));
        }
        return categoryRepository.save(category);
    }

    // --- BRANDS ---

    @Cacheable(value = "brands")
    @Transactional(readOnly = true)
    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    @CacheEvict(value = "brands", allEntries = true)
    @Transactional
    public Brand createBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    // --- MAPPING UTILITY ---

    private ProductDTO convertToDTO(Product product) {
        Integer stockVal = 0;
        Optional<Inventory> inv = inventoryRepository.findByProductId(product.getId());
        if (inv.isPresent()) {
            stockVal = inv.get().getAvailableStock();
        }

        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .sku(product.getSku())
                .barcode(product.getBarcode())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .brandId(product.getBrand().getId())
                .brandName(product.getBrand().getName())
                .active(product.isActive())
                .stockLevel(stockVal)
                .build();
    }
}
