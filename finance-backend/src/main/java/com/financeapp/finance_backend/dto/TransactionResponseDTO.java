package com.financeapp.finance_backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.financeapp.finance_backend.enums.PaymentMethod;
import com.financeapp.finance_backend.enums.TransactionType;

import lombok.Data;

@Data
public class TransactionResponseDTO {
    private Long id;
    private Long userId; // Flattened for the frontend
    private TransactionType type;
    private Double amount;
    private String category;
    private String description;
    private LocalDate transactionDate;
    private PaymentMethod paymentMethod;
    private LocalDateTime createdAt;
}
