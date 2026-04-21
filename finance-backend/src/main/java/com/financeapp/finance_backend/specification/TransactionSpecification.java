package com.financeapp.finance_backend.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.financeapp.finance_backend.dto.TransactionFilterDTO;
import com.financeapp.finance_backend.model.Transaction;

import jakarta.persistence.criteria.Predicate;

/**
 * Builds a JPA Specification<Transaction> from a TransactionFilterDTO.
 * All predicates are combined with AND.
 */
public class TransactionSpecification {

    private TransactionSpecification() {}

    public static Specification<Transaction> build(TransactionFilterDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // ── Always filter by user ─────────────────────────────
            predicates.add(cb.equal(root.get("user").get("id"), filter.getUserId()));

            // ── Type ─────────────────────────────────────────────
            if (filter.getType() != null) {
                predicates.add(cb.equal(root.get("type"), filter.getType()));
            }

            // ── Category ─────────────────────────────────────────
            if (filter.getCategory() != null && !filter.getCategory().isBlank()) {
                predicates.add(cb.equal(
                    cb.upper(root.get("category")),
                    filter.getCategory().toUpperCase()
                ));
            }

            // ── Payment Method ────────────────────────────────────
            if (filter.getPaymentMethod() != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), filter.getPaymentMethod()));
            }

            // ── Date Range ────────────────────────────────────────
            if (filter.getStartDate() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("transactionDate"), filter.getStartDate()));
            }
            if (filter.getEndDate() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("transactionDate"), filter.getEndDate()));
            }

            // ── Month ─────────────────────────────────────────────
            if (filter.getMonth() != null) {
                predicates.add(cb.equal(
                    cb.function("MONTH", Integer.class, root.get("transactionDate")),
                    filter.getMonth()
                ));
            }

            // ── Year ──────────────────────────────────────────────
            if (filter.getYear() != null) {
                predicates.add(cb.equal(
                    cb.function("YEAR", Integer.class, root.get("transactionDate")),
                    filter.getYear()
                ));
            }

            // ── Keyword search (description) ──────────────────────
            if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
                String pattern = "%" + filter.getSearch().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("description")), pattern));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
