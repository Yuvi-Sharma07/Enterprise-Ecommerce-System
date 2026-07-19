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

        // 9. Seed Warehouses
        Warehouse nycWh = createWarehouse("NYC East Coast Hub", "New York City", 10000);
        Warehouse laWh = createWarehouse("LA West Coast Hub", "Los Angeles", 8000);

        // 8. Seed Products (1020 items for high-volume buyable catalog)
        Category[] cats = {electronics, apparel, sports, kitchen};
        Brand[] brs = {techCorp, fitWear, homeStyle};

        String[][] names = {
            {"Smartwatch Pro v2", "Ultra Wireless Buds", "Mechanical Keyboard MX", "USB-C Dock Hub"},
            {"Denim Jacket Classic", "Cotton Hoodie Relaxed", "Leather Sneakers Sport", "Running Shorts Flex"},
            {"Eco Yoga Mat", "Stainless Steel Flask", "Dumbbell Set 10kg", "Adjustable Jump Rope"},
            {"Power Blender 1000", "Espresso Coffee Machine", "Non-stick Frying Pan", "Minimalist Desk Lamp"}
        };

        String[][] images = {
            {
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
                "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
                "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
                "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=600",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600",
                "https://images.unsplash.com/photo-1527690710607-e57cd5338321?w=600",
                "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600",
                "https://images.unsplash.com/photo-1608248597481-496100c80836?w=600",
                "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600"
            },
            {
                "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600",
                "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
                "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
                "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600",
                "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
                "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
                "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600",
                "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
                "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600"
            },
            {
                "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600",
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600",
                "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600",
                "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600",
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600",
                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600",
                "https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?w=600",
                "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600",
                "https://images.unsplash.com/photo-1595078475328-1ab0540ae167?w=600",
                "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600"
            },
            {
                "https://images.unsplash.com/photo-1578643463396-0997cb5328c1?w=600",
                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",
                "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600",
                "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
                "https://images.unsplash.com/photo-1531234799389-dcb7651eb0a2?w=600",
                "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600",
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600",
                "https://images.unsplash.com/photo-1530062845289-445889f9e113?w=600",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
                "https://images.unsplash.com/photo-1585518419759-7fe2ec7f3e5e?w=600"
            }
        };

        String[] baseSkus = {"ELEC", "APPR", "SPRT", "KTCH"};

        for (int i = 1; i <= 1020; i++) {
            int catIdx = i % cats.length;
            int itemIdx = (i / cats.length) % names[catIdx].length;
            int brandIdx = i % brs.length;

            String name = names[catIdx][itemIdx] + " #" + i;
            String desc = "Programmatically generated high-quality wholesale catalog entry " + name + " featuring standard industrial specs, long battery/material durability guarantees.";
            BigDecimal price = new BigDecimal(10.0 + (i % 250) * 1.99).setScale(2, java.math.RoundingMode.HALF_UP);
            String sku = "SKU-" + baseSkus[catIdx] + "-" + String.format("%04d", i);
            String imgUrl = images[catIdx][i % images[catIdx].length];

            Product seededProduct = createProduct(name, desc, price, sku, imgUrl, cats[catIdx], brs[brandIdx]);

            // Seed Warehouse inventory allocations so they are active and buyable
            createStock(nycWh, seededProduct, 80 + (i % 40));
            createStock(laWh, seededProduct, 40 + (i % 30));
        }

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
