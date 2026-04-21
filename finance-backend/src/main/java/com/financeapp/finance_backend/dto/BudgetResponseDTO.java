package com.financeapp.finance_backend.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class BudgetResponseDTO {
    private Long id;
    private Long userId;
    private Integer month;
    private Integer year;
    private Double amount;         // budget limit

    // Computed fields — populated by the service
    private Double totalExpense;   // sum of EXPENSE transactions for this month/year
    private Double remaining;      // amount - totalExpense
    private Double usedPercentage; // (totalExpense / amount) * 100
    private String status;         // SAFE | WARNING | EXCEEDED

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
