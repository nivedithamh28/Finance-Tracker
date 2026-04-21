package com.financeapp.finance_backend.service;

import java.time.LocalDate;
import java.time.YearMonth;

import org.springframework.stereotype.Service;

import com.financeapp.finance_backend.dto.BudgetRequestDTO;
import com.financeapp.finance_backend.dto.BudgetResponseDTO;
import com.financeapp.finance_backend.enums.TransactionType;
import com.financeapp.finance_backend.exception.ConflictException;
import com.financeapp.finance_backend.exception.ResourceNotFoundException;
import com.financeapp.finance_backend.model.Budget;
import com.financeapp.finance_backend.model.User;
import com.financeapp.finance_backend.repository.BudgetRepository;
import com.financeapp.finance_backend.repository.TransactionRepository;
import com.financeapp.finance_backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public BudgetResponseDTO createBudget(BudgetRequestDTO dto) {
        validate(dto);

        if (budgetRepository.existsByUserIdAndMonthAndYear(dto.getUserId(), dto.getMonth(), dto.getYear())) {
            throw new ConflictException("Budget already exists for " + dto.getMonth() + "/" + dto.getYear());
        }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + dto.getUserId()));

        Budget budget = new Budget();
        budget.setUser(user);
        budget.setMonth(dto.getMonth());
        budget.setYear(dto.getYear());
        budget.setAmount(dto.getAmount());

        return toResponseDTO(budgetRepository.save(budget));
    }

    public BudgetResponseDTO getCurrentMonthBudget(Long userId) {
        LocalDate now = LocalDate.now();
        return getBudgetForMonth(userId, now.getMonthValue(), now.getYear());
    }

    public java.util.List<BudgetResponseDTO> getAllBudgets(Long userId) {
        return budgetRepository.findByUserIdOrderByYearDescMonthDesc(userId)
                .stream()
                .map(this::toResponseDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    public BudgetResponseDTO getBudgetForMonth(Long userId, Integer month, Integer year) {
        Budget budget = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Budget not found for user " + userId + " and " + month + "/" + year));
        return toResponseDTO(budget);
    }

    @Transactional
    public BudgetResponseDTO updateBudget(Long id, BudgetRequestDTO dto) {
        if (dto.getAmount() == null || dto.getAmount() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }

        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with ID: " + id));

        if (dto.getUserId() != null && !budget.getUser().getId().equals(dto.getUserId())) {
            User newUser = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + dto.getUserId()));
            budget.setUser(newUser);
        }

        if (dto.getMonth() != null) {
            if (dto.getMonth() < 1 || dto.getMonth() > 12) {
                throw new IllegalArgumentException("Month must be between 1 and 12");
            }
            budget.setMonth(dto.getMonth());
        }
        if (dto.getYear() != null) {
            if (dto.getYear() < 1900) {
                throw new IllegalArgumentException("Year must be valid");
            }
            budget.setYear(dto.getYear());
        }

        // Ensure unique (user, month, year) after update
        boolean duplicate = budgetRepository.findByUserIdAndMonthAndYear(
                        budget.getUser().getId(),
                        budget.getMonth(),
                        budget.getYear()
                )
                .filter(existing -> !existing.getId().equals(budget.getId()))
                .isPresent();
        if (duplicate) {
            throw new ConflictException("Budget already exists for " + budget.getMonth() + "/" + budget.getYear());
        }

        budget.setAmount(dto.getAmount());

        return toResponseDTO(budgetRepository.save(budget));
    }

    @Transactional
    public void deleteBudget(Long id) {
        if (!budgetRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Budget not found with ID: " + id);
        }
        budgetRepository.deleteById(id);
    }

    private void validate(BudgetRequestDTO dto) {
        if (dto.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (dto.getMonth() == null || dto.getMonth() < 1 || dto.getMonth() > 12) {
            throw new IllegalArgumentException("Month must be between 1 and 12");
        }
        if (dto.getYear() == null || dto.getYear() < 1900) {
            throw new IllegalArgumentException("Year must be valid");
        }
        if (dto.getAmount() == null || dto.getAmount() <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }
    }

    private BudgetResponseDTO toResponseDTO(Budget budget) {
        BudgetResponseDTO dto = new BudgetResponseDTO();
        dto.setId(budget.getId());
        dto.setUserId(budget.getUser().getId());
        dto.setMonth(budget.getMonth());
        dto.setYear(budget.getYear());
        dto.setAmount(budget.getAmount());
        dto.setCreatedAt(budget.getCreatedAt());
        dto.setUpdatedAt(budget.getUpdatedAt());

        BudgetComputed computed = compute(budget.getUser().getId(), budget.getMonth(), budget.getYear(), budget.getAmount());
        dto.setTotalExpense(computed.totalExpense());
        dto.setRemaining(computed.remaining());
        dto.setUsedPercentage(computed.usedPercentage());
        dto.setStatus(computed.status());

        return dto;
    }

    private BudgetComputed compute(Long userId, Integer month, Integer year, Double budgetAmount) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        double totalExpense = transactionRepository.sumAmountByUserAndTypeAndDateRange(
                userId,
                TransactionType.EXPENSE,
                start,
                end
        );

        double usedPercentage = budgetAmount > 0 ? (totalExpense / budgetAmount) * 100.0 : 0.0;
        double remaining = budgetAmount - totalExpense;

        String status;
        if (usedPercentage > 100.0) {
            status = "EXCEEDED";
        } else if (usedPercentage >= 80.0) {
            status = "WARNING";
        } else {
            status = "SAFE";
        }

        return new BudgetComputed(totalExpense, remaining, usedPercentage, status);
    }

    private record BudgetComputed(double totalExpense, double remaining, double usedPercentage, String status) {}
}
