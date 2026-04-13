package com.financeapp.finance_backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDTO {
    @NotBlank(message = "Full name is required")
    private String fullName;
    @Email(message = "Invalid email address")
    @NotBlank(message = "Email is required")
    private String email;
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    @NotBlank(message = "Confirm password is required")
    @Size(min = 6, message = "Confirm password must be at least 6 characters")
    private String confirmPassword;
     @NotBlank(message = "Currency preference is required")
    private String currencyPreference;
}
