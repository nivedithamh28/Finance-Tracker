package com.financeapp.finance_backend.dto;

import java.time.LocalDate;

import com.financeapp.finance_backend.enums.PaymentMethod;
import com.financeapp.finance_backend.enums.TransactionType;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TransactionRequestDTO {
    @NotNull(message = "User ID is required")
    private Long userId; // Frontend sends the ID
    private TransactionType type;
    private Double amount;
    private String category;
    private String description;
    private LocalDate transactionDate;
    private PaymentMethod paymentMethod;
}
