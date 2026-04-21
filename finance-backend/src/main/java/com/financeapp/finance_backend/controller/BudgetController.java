package com.financeapp.finance_backend.controller;

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

import com.financeapp.finance_backend.dto.BudgetRequestDTO;
import com.financeapp.finance_backend.dto.BudgetResponseDTO;
import com.financeapp.finance_backend.service.BudgetService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BudgetController {

    private final BudgetService service;

    /**
     * Set Monthly Budget
     * POST /api/budgets
     */
    @PostMapping
    public ResponseEntity<BudgetResponseDTO> create(@Valid @RequestBody BudgetRequestDTO dto) {
        return new ResponseEntity<>(service.createBudget(dto), HttpStatus.CREATED);
    }

    /**
     * View Current Month Budget
     * GET /api/budgets/current?userId=123
     */
    @GetMapping("/current")
    public ResponseEntity<BudgetResponseDTO> getCurrent(@RequestParam Long userId) {
        return ResponseEntity.ok(service.getCurrentMonthBudget(userId));
    }

    /**
     * View all budgets for a user (full history)
     * GET /api/budgets/all?userId=123
     */
    @GetMapping("/all")
    public ResponseEntity<java.util.List<BudgetResponseDTO>> getAll(@RequestParam Long userId) {
        return ResponseEntity.ok(service.getAllBudgets(userId));
    }

    /**
     * View a specific Month Budget
     * GET /api/budgets?userId=123&month=4&year=2026
     */
    @GetMapping
    public ResponseEntity<BudgetResponseDTO> getForMonth(
            @RequestParam Long userId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return ResponseEntity.ok(service.getBudgetForMonth(userId, month, year));
    }

    /**
     * Update Monthly Budget
     * PUT /api/budgets/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponseDTO> update(@PathVariable Long id, @RequestBody BudgetRequestDTO dto) {
        return ResponseEntity.ok(service.updateBudget(id, dto));
    }

    /**
     * Delete Monthly Budget (optional)
     * DELETE /api/budgets/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}

