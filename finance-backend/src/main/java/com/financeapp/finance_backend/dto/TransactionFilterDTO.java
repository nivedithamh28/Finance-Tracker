package com.financeapp.finance_backend.dto;

import java.time.LocalDate;

import com.financeapp.finance_backend.enums.PaymentMethod;
import com.financeapp.finance_backend.enums.TransactionType;

import lombok.Data;

/**
 * Holds all optional filter + sort parameters for the transaction listing endpoint.
 */
@Data
public class TransactionFilterDTO {

    // ── Core filter ──────────────────────────────────────────
    private Long userId;               // always required

    private TransactionType type;      // INCOME | EXPENSE
    private String category;           // e.g. FOOD, SALARY
    private PaymentMethod paymentMethod;

    // ── Date filters ─────────────────────────────────────────
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer month;             // 1-12
    private Integer year;              // e.g. 2026

    // ── Keyword search ───────────────────────────────────────
    private String search;             // matches description (case-insensitive)

    // ── Sorting ──────────────────────────────────────────────
    private String sortBy  = "transactionDate"; // transactionDate | amount
    private String sortDir = "desc";            // asc | desc

    // ── Pagination ──────────────────────────────────────────
    private Integer page = 0;   // 0-based page number
    private Integer size = 10;  // items per page
}
