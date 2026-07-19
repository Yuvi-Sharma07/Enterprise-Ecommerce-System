package com.enterprise.ecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    private String role; // CUSTOMER, ADMIN, WAREHOUSE_MANAGER, SUPPLIER

    // Optional fields for customer profile creation
    private String firstName;
    private String lastName;
    private String phone;
    private String address;
}
