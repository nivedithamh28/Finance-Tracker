package com.financeapp.finance_backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserProfileUpdateDTO {
    @NotBlank(message = "Full name is required")
    private String fullName;
    private String currencyPreference;
    private Double monthlyIncome;
}
