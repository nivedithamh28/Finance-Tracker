package com.financeapp.finance_backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnalyticsSummaryDTO {

    private Double totalIncome;
    private Double totalExpense;
    private Double netBalance;
    private Long totalTransactions;

    private String topSpendingCategory;
    private Double highestExpenseAmount;
    private String highestExpenseDescription;

    private Double avgExpensePerMonth;
    private Double avgIncomePerMonth;

    private List<CategorySummaryDTO> categoryExpenses;
    private List<MonthlyTrendDTO> monthlyTrends;
}
