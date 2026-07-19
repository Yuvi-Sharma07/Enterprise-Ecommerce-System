package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.dto.*;
import com.enterprise.ecommerce.model.*;
import com.enterprise.ecommerce.repository.*;
import com.enterprise.ecommerce.security.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        String refreshToken = jwtUtils.generateRefreshTokenFromUsername(userDetails.getUsername());

        Long customerId = null;
        if (roles.contains(RoleName.ROLE_CUSTOMER.name())) {
            Optional<Customer> customerOpt = customerRepository.findByUserId(userDetails.getId());
            if (customerOpt.isPresent()) {
                customerId = customerOpt.get().getId();
            }
        }

        return JwtResponse.builder()
                .accessToken(jwt)
                .refreshToken(refreshToken)
                .id(userDetails.getId())
                .email(userDetails.getUsername())
                .roles(roles)
                .customerId(customerId)
                .build();
    }

    @Transactional
    public void registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        bootstrapRoles();

        User user = User.builder()
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .enabled(true)
                .verificationToken(UUID.randomUUID().toString())
                .build();

        String strRole = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRole == null) {
            Role userRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            switch (strRole.toUpperCase()) {
                case "ADMIN":
                    Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(adminRole);
                    break;
                case "WAREHOUSE_MANAGER":
                    Role wmRole = roleRepository.findByName(RoleName.ROLE_WAREHOUSE_MANAGER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(wmRole);
                    break;
                case "SUPPLIER":
                    Role supplierRole = roleRepository.findByName(RoleName.ROLE_SUPPLIER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(supplierRole);
                    break;
                default:
                    Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                            .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                    roles.add(customerRole);
            }
        }

        user.setRoles(roles);
        User savedUser = userRepository.save(user);

        if (roles.stream().anyMatch(r -> r.getName() == RoleName.ROLE_CUSTOMER)) {
            Customer customer = Customer.builder()
                    .user(savedUser)
                    .firstName(signUpRequest.getFirstName() != null ? signUpRequest.getFirstName() : "Customer")
                    .lastName(signUpRequest.getLastName() != null ? signUpRequest.getLastName() : "")
                    .phone(signUpRequest.getPhone())
                    .address(signUpRequest.getAddress())
                    .build();
            Customer savedCustomer = customerRepository.save(customer);

            Cart cart = Cart.builder()
                    .customer(savedCustomer)
                    .items(new ArrayList<>())
                    .build();
            // Cart creation handled internally
        }

        sendVerificationEmail(savedUser);
    }

    private void bootstrapRoles() {
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(Role.builder().name(roleName).build());
            }
        }
    }

    private void sendVerificationEmail(User user) {
        String verificationUrl = "http://localhost:8080/api/auth/verify?token=" + user.getVerificationToken();
        System.out.println("--- REGISTRATION VERIFICATION URL FOR " + user.getEmail() + " ---");
        System.out.println(verificationUrl);
        System.out.println("-----------------------------------------------------------------");

        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(user.getEmail());
                message.setSubject("E-Commerce Verification Token");
                message.setText("Click the following link to verify your email address: " + verificationUrl);
                mailSender.send(message);
            }
        } catch (Exception e) {
            System.err.println("Could not send email notification: " + e.getMessage());
        }
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid verification token"));

        user.setEnabled(true);
        user.setVerificationToken(null);
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + request.getEmail()));

        user.setResetPasswordToken(UUID.randomUUID().toString());
        userRepository.save(user);

        String resetUrl = "http://localhost:5173/reset-password?token=" + user.getResetPasswordToken();
        System.out.println("--- PASSWORD RESET LINK FOR " + user.getEmail() + " ---");
        System.out.println(resetUrl);
        System.out.println("-----------------------------------------------------------");

        try {
            if (mailSender != null) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(user.getEmail());
                message.setSubject("E-Commerce Password Reset Request");
                message.setText("Click the following link to reset your password: " + resetUrl);
                mailSender.send(message);
            }
        } catch (Exception e) {
            System.err.println("Could not send password reset email: " + e.getMessage());
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        userRepository.save(user);
    }

    @Transactional
    public TokenRefreshResponse refreshToken(TokenRefreshRequest request) {
        String token = request.getRefreshToken();
        if (jwtUtils.validateJwtToken(token)) {
            String username = jwtUtils.getUserNameFromJwtToken(token);
            String newAccessToken = jwtUtils.generateTokenFromUsername(username, 3600000);
            String newRefreshToken = jwtUtils.generateRefreshTokenFromUsername(username);
            return new TokenRefreshResponse(newAccessToken, newRefreshToken);
        } else {
            throw new IllegalArgumentException("Refresh token is invalid or expired");
        }
    }
}
