package com.enterprise.ecommerce.config;

import com.enterprise.ecommerce.model.*;
import com.enterprise.ecommerce.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private WarehouseRepository warehouseRepository;

    @Autowired
    private WarehouseStockRepository warehouseStockRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        bootstrapRoles();

        // 2. Check if DB is already seeded
        if (userRepository.count() > 0) {
            return;
        }

        // 3. Seed Users
        User adminUser = createUser("admin@ecomm.com", "admin123", RoleName.ROLE_ADMIN);
        User managerUser = createUser("manager@ecomm.com", "manager123", RoleName.ROLE_WAREHOUSE_MANAGER);
        User supplierUser = createUser("supplier@ecomm.com", "supplier123", RoleName.ROLE_SUPPLIER);
        User customerUser = createUser("customer@ecomm.com", "customer123", RoleName.ROLE_CUSTOMER);

        // 4. Create Customer Profile
        Customer customer = Customer.builder()
                .user(customerUser)
                .firstName("Demo")
                .lastName("Customer")
                .phone("+1 555-0100")
                .address("742 Evergreen Terrace, Springfield")
                .build();
        customerRepository.save(customer);

        // 5. Create Supplier Profile (Optional reference registry)
        // Suppliers are listed directly in Supplier Dashboard

        // 6. Seed Categories
        Category electronics = createCategory("Electronics", "electronics");
        Category apparel = createCategory("Apparel", "apparel");
        Category sports = createCategory("Sports & Outdoors", "sports");
        Category kitchen = createCategory("Home & Kitchen", "kitchen");

        // 7. Seed Brands
        Brand techCorp = createBrand("TechCorp");
        Brand fitWear = createBrand("FitWear");
        Brand homeStyle = createBrand("HomeStyle");

        // 8. Seed Products
        Product watch = createProduct("Smartwatch Pro", "Advanced multi-sport tracker with ECG sensor and 7-day battery life.", new BigDecimal("199.99"), "TECH-SW-01", "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600", electronics, techCorp);
        Product earbuds = createProduct("Wireless Buds Elite", "Active noise cancelling wireless earbuds with premium high-fidelity acoustics.", new BigDecimal("89.99"), "TECH-WE-02", "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600", electronics, techCorp);
        Product hoodie = createProduct("Denim Jacket Classic", "Comfortable cotton denim hoodie style jacket suitable for winter season wear.", new BigDecimal("59.99"), "WEAR-DJ-03", "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600", apparel, fitWear);
        Product mat = createProduct("Eco Yoga Mat", "High density eco-friendly biodegradable material yoga workout positioning mat.", new BigDecimal("29.99"), "SPRT-YM-04", "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600", sports, fitWear);
        Product blender = createProduct("Power Blender 1000", "High speed countertop kitchen blender for juices, shakes, and food preps.", new BigDecimal("129.99"), "KITCH-PB-05", "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600", kitchen, homeStyle);

        // 9. Seed Warehouses
        Warehouse nycWh = createWarehouse("NYC East Coast Hub", "New York City", 10000);
        Warehouse laWh = createWarehouse("LA West Coast Hub", "Los Angeles", 8000);

        // 10. Seed Stock Levels
        createStock(nycWh, watch, 120);
        createStock(laWh, watch, 80);

        createStock(nycWh, earbuds, 250);
        createStock(laWh, earbuds, 150);

        createStock(nycWh, hoodie, 100);
        createStock(nycWh, mat, 80);
        createStock(laWh, blender, 60);

        // 11. Seed Coupons
        createCoupon("SUMMER20", DiscountType.PERCENTAGE, new BigDecimal("20.00"), 100);
        createCoupon("WELCOME10", DiscountType.FLAT, new BigDecimal("10.00"), 200);

        System.out.println("--- ENTERPRISE E-COMMERCE SEED DATA INITIALIZED SUCCESSFUL ---");
    }

    private void bootstrapRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().name(roleName).build());
            }
        }
    }

    private User createUser(String email, String password, RoleName roleName) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
        User user = User.builder()
                .email(email)
                .password(encoder.encode(password))
                .enabled(true)
                .roles(Set.of(role))
                .build();
        return userRepository.save(user);
    }

    private Category createCategory(String name, String slug) {
        Category category = Category.builder()
                .name(name)
                .slug(slug)
                .build();
        return categoryRepository.save(category);
    }

    private Brand createBrand(String name) {
        Brand brand = Brand.builder()
                .name(name)
                .build();
        return brandRepository.save(brand);
    }

    private Product createProduct(String name, String desc, BigDecimal price, String sku, String imageUrl, Category cat, Brand b) {
        Product p = Product.builder()
                .name(name)
                .description(desc)
                .price(price)
                .sku(sku)
                .barcode(sku + "-BC")
                .imageUrl(imageUrl)
                .category(cat)
                .brand(b)
                .active(true)
                .build();
        return productRepository.save(p);
    }

    private Warehouse createWarehouse(String name, String location, int cap) {
        Warehouse w = Warehouse.builder()
                .name(name)
                .location(location)
                .maxCapacity(cap)
                .build();
        return warehouseRepository.save(w);
    }

    private void createStock(Warehouse w, Product p, int qty) {
        WarehouseStock stock = WarehouseStock.builder()
                .warehouse(w)
                .product(p)
                .stockQuantity(qty)
                .build();
        warehouseStockRepository.save(stock);
        
        // Update product aggregated stock in Inventory table
        Inventory inv = inventoryRepository.findByProductId(p.getId())
                .orElse(Inventory.builder()
                        .product(p)
                        .currentStock(0)
                        .reservedStock(0)
                        .availableStock(0)
                        .lowStockThreshold(10)
                        .build());
        
        inv.setCurrentStock(inv.getCurrentStock() + qty);
        inv.syncAvailableStock();
        inventoryRepository.save(inv);

        // Update transient or DTO display values during querying - db relies on warehouse stocks aggregation
    }

    private void createCoupon(String code, DiscountType type, BigDecimal value, int limit) {
        Coupon c = Coupon.builder()
                .code(code)
                .discountType(type)
                .discountValue(value)
                .usageLimit(limit)
                .usageCount(0)
                .active(true)
                .expiryDate(java.time.LocalDateTime.now().plusDays(30))
                .build();
        couponRepository.save(c);
    }
}
