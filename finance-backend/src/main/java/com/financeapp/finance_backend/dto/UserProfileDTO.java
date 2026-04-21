package com.financeapp.finance_backend.dto;

import lombok.Data;

@Data
public class UserProfileDTO {
    private Long id;
    private String fullName;
    private String email;
    private String currencyPreference;
    private Double monthlyIncome;
}
