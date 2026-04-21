package com.financeapp.finance_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MonthlyTrendDTO {
    private String month;   // e.g. "Jan 2026"
    private Double income;
    private Double expense;
}
