package com.financeapp.finance_backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.financeapp.finance_backend.enums.TransactionType;
import com.financeapp.finance_backend.model.Transaction;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>,
        JpaSpecificationExecutor<Transaction> {

    @Query("""
            select coalesce(sum(t.amount), 0)
            from Transaction t
            where t.user.id = :userId
              and t.type = :type
              and t.transactionDate >= :startDate
              and t.transactionDate <= :endDate
            """)
    Double sumAmountByUserAndTypeAndDateRange(
            @Param("userId") Long userId,
            @Param("type") TransactionType type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /** Category-wise expense totals: returns [category (String), total (Double)] */
    @Query("""
            select t.category, coalesce(sum(t.amount), 0)
            from Transaction t
            where t.user.id = :userId
              and t.type = 'EXPENSE'
            group by t.category
            order by sum(t.amount) desc
            """)
    List<Object[]> findCategoryExpenseTotals(@Param("userId") Long userId);

    /**
     * Monthly income/expense totals: returns [year (Integer), month (Integer),
     * type (String), total (Double)]
     */
    @Query("""
            select year(t.transactionDate), month(t.transactionDate),
                   t.type, coalesce(sum(t.amount), 0)
            from Transaction t
            where t.user.id = :userId
            group by year(t.transactionDate), month(t.transactionDate), t.type
            order by year(t.transactionDate) asc, month(t.transactionDate) asc
            """)
    List<Object[]> findMonthlyTotals(@Param("userId") Long userId);

    /** Total transaction count for a user. */
    Long countByUserId(Long userId);

    /** Single highest-amount EXPENSE transaction for a user. */
    @Query("""
            select t from Transaction t
            where t.user.id = :userId
              and t.type = 'EXPENSE'
            order by t.amount desc
            """)
    List<Transaction> findTopExpensesByUser(@Param("userId") Long userId,
            org.springframework.data.domain.Pageable pageable);
}
