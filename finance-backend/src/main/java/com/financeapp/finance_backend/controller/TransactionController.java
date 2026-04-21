package com.financeapp.finance_backend.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.financeapp.finance_backend.dto.PageResponseDTO;
import com.financeapp.finance_backend.dto.TransactionFilterDTO;
import com.financeapp.finance_backend.dto.TransactionRequestDTO;
import com.financeapp.finance_backend.dto.TransactionResponseDTO;
import com.financeapp.finance_backend.enums.PaymentMethod;
import com.financeapp.finance_backend.enums.TransactionType;
import com.financeapp.finance_backend.service.TransactionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransactionController {

    private final TransactionService service;

    @PostMapping
    public ResponseEntity<TransactionResponseDTO> addTransaction(
            @Valid @RequestBody TransactionRequestDTO dto) {
        return new ResponseEntity<>(service.createTransaction(dto), HttpStatus.CREATED);
    }

    /**
     * GET /api/transactions/user/{userId}
     * All filter and sort parameters are optional query params.
     *
     * @param userId        required — the user's ID
     * @param type          optional — INCOME | EXPENSE
     * @param category      optional — e.g. FOOD, SALARY
     * @param paymentMethod optional — UPI | CASH | CARD | BANK_TRANSFER
     * @param startDate     optional — ISO date, e.g. 2026-01-01
     * @param endDate       optional — ISO date, e.g. 2026-12-31
     * @param month         optional — 1-12
     * @param year          optional — e.g. 2026
     * @param search        optional — keyword matched against description
     * @param sortBy        optional — transactionDate (default) | amount
     * @param sortDir       optional — desc (default) | asc
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<PageResponseDTO<TransactionResponseDTO>> getAll(
            @PathVariable Long userId,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "transactionDate") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {

        TransactionFilterDTO filter = new TransactionFilterDTO();
        filter.setUserId(userId);
        filter.setType(type);
        filter.setCategory(category);
        filter.setPaymentMethod(paymentMethod);
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);
        filter.setMonth(month);
        filter.setYear(year);
        filter.setSearch(search);
        filter.setSortBy(sortBy);
        filter.setSortDir(sortDir);
        filter.setPage(page);
        filter.setSize(size);

        return ResponseEntity.ok(service.getAllTransactions(filter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(service.getTransactionById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponseDTO> update(
            @PathVariable Long id,
            @RequestBody TransactionRequestDTO dto) {
        return ResponseEntity.ok(service.updateTransaction(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteTransaction(id);
        return ResponseEntity.noContent().build();
    }
}