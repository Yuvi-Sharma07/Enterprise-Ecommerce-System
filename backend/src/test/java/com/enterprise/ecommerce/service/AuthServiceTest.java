package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.dto.RegisterRequest;
import com.enterprise.ecommerce.model.Role;
import com.enterprise.ecommerce.model.RoleName;
import com.enterprise.ecommerce.model.User;
import com.enterprise.ecommerce.repository.CustomerRepository;
import com.enterprise.ecommerce.repository.RoleRepository;
import com.enterprise.ecommerce.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void registerUser_EmailAlreadyExists_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("password");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.registerUser(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerUser_SuccessfulRegistration_SavesUser() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setPassword("password123");
        request.setRole("CUSTOMER");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_CUSTOMER))
                .thenReturn(Optional.of(Role.builder().name(RoleName.ROLE_CUSTOMER).build()));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        
        User savedUser = User.builder().id(1L).email(request.getEmail()).enabled(false).build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        authService.registerUser(request);

        verify(userRepository, times(1)).save(any(User.class));
    }
}
