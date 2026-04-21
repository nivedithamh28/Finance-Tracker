package com.financeapp.finance_backend.service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.financeapp.finance_backend.dto.AnalyticsSummaryDTO;
import com.financeapp.finance_backend.dto.CategorySummaryDTO;
import com.financeapp.finance_backend.dto.MonthlyTrendDTO;
import com.financeapp.finance_backend.model.Transaction;
import com.financeapp.finance_backend.repository.TransactionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;

    private static final String[] MONTH_NAMES = {
            "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    public AnalyticsSummaryDTO getSummary(Long userId) {

        // ── Category expense totals ───────────────────────────────────
        List<Object[]> categoryRows = transactionRepository.findCategoryExpenseTotals(userId);
        List<CategorySummaryDTO> categoryExpenses = categoryRows.stream()
                .map(r -> new CategorySummaryDTO((String) r[0], toDouble(r[1])))
                .collect(Collectors.toList());

        String topSpendingCategory = categoryExpenses.isEmpty()
                ? "N/A"
                : categoryExpenses.get(0).getCategory();

        // ── Monthly trends ────────────────────────────────────────────
        List<Object[]> monthlyRows = transactionRepository.findMonthlyTotals(userId);

        // Map key = "YYYY-MM" → {income, expense}
        Map<String, double[]> trendMap = new LinkedHashMap<>();
        for (Object[] row : monthlyRows) {
            int year  = toInt(row[0]);
            int month = toInt(row[1]);
            String key = year + "-" + String.format("%02d", month);
            String type = row[2].toString();
            double amount = toDouble(row[3]);

            trendMap.computeIfAbsent(key, k -> new double[2]);
            double[] vals = trendMap.get(key);
            if ("INCOME".equals(type))  vals[0] += amount;
            if ("EXPENSE".equals(type)) vals[1] += amount;
        }

        List<MonthlyTrendDTO> monthlyTrends = new ArrayList<>();
        double totalIncome  = 0;
        double totalExpense = 0;

        for (Map.Entry<String, double[]> entry : trendMap.entrySet()) {
            String[] parts = entry.getKey().split("-");
            int year  = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            double inc = entry.getValue()[0];
            double exp = entry.getValue()[1];
            totalIncome  += inc;
            totalExpense += exp;
            monthlyTrends.add(new MonthlyTrendDTO(
                    MONTH_NAMES[month] + " " + year, inc, exp));
        }

        // ── Averages ──────────────────────────────────────────────────
        int distinctMonths = trendMap.size();
        double avgIncome  = distinctMonths > 0 ? totalIncome  / distinctMonths : 0;
        double avgExpense = distinctMonths > 0 ? totalExpense / distinctMonths : 0;

        // ── Highest expense ───────────────────────────────────────────
        List<Transaction> topExpenses = transactionRepository
                .findTopExpensesByUser(userId, PageRequest.of(0, 1));
        double highestAmount = 0;
        String highestDesc   = "N/A";
        if (!topExpenses.isEmpty()) {
            Transaction top = topExpenses.get(0);
            highestAmount = top.getAmount() != null ? top.getAmount() : 0;
            highestDesc   = top.getDescription() != null ? top.getDescription()
                          : top.getCategory();
        }

        // ── Transaction count ─────────────────────────────────────────
        Long totalTransactions = transactionRepository.countByUserId(userId);

        return new AnalyticsSummaryDTO(
                totalIncome,
                totalExpense,
                totalIncome - totalExpense,
                totalTransactions,
                topSpendingCategory,
                highestAmount,
                highestDesc,
                avgExpense,
                avgIncome,
                categoryExpenses,
                monthlyTrends
        );
    }

    // ── helpers ───────────────────────────────────────────────────────
    private double toDouble(Object o) {
        if (o == null) return 0;
        if (o instanceof Number) return ((Number) o).doubleValue();
        return 0;
    }

    private int toInt(Object o) {
        if (o == null) return 0;
        if (o instanceof Number) return ((Number) o).intValue();
        return 0;
    }
}
