package com.financeapp.finance_backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.financeapp.finance_backend.model.Budget;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    boolean existsByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);

    Optional<Budget> findByUserIdAndMonthAndYear(Long userId, Integer month, Integer year);

    java.util.List<Budget> findByUserIdOrderByYearDescMonthDesc(Long userId);
}

