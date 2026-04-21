package com.financeapp.finance_backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.financeapp.finance_backend.dto.PageResponseDTO;
import com.financeapp.finance_backend.dto.TransactionFilterDTO;
import com.financeapp.finance_backend.dto.TransactionRequestDTO;
import com.financeapp.finance_backend.dto.TransactionResponseDTO;
import com.financeapp.finance_backend.exception.ResourceNotFoundException;
import com.financeapp.finance_backend.mapper.TransactionMapper;
import com.financeapp.finance_backend.model.Transaction;
import com.financeapp.finance_backend.model.User;
import com.financeapp.finance_backend.repository.TransactionRepository;
import com.financeapp.finance_backend.repository.UserRepository;
import com.financeapp.finance_backend.specification.TransactionSpecification;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final TransactionMapper transactionMapper;

    /**
     * Creates a new transaction.
     */
    @Transactional
    public TransactionResponseDTO createTransaction(TransactionRequestDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + dto.getUserId()));

        Transaction transaction = transactionMapper.toEntity(dto);
        transaction.setUser(user);

        return transactionMapper.toResponseDTO(transactionRepository.save(transaction));
    }

    /**
     * Fetches a paginated, filtered, sorted list of transactions for a user.
     */
    public PageResponseDTO<TransactionResponseDTO> getAllTransactions(TransactionFilterDTO filter) {
        // Build sort
        String sortField = isValidSortField(filter.getSortBy()) ? filter.getSortBy() : "transactionDate";
        Sort.Direction dir = "asc".equalsIgnoreCase(filter.getSortDir()) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(dir, sortField);

        // Build pageable (page is 0-based, size defaults to 10)
        int page = filter.getPage() != null && filter.getPage() >= 0 ? filter.getPage() : 0;
        int size = filter.getSize() != null && filter.getSize() > 0 ? Math.min(filter.getSize(), 100) : 10;
        Pageable pageable = PageRequest.of(page, size, sort);

        // Build specification
        Specification<Transaction> spec = TransactionSpecification.build(filter);

        // Execute
        Page<Transaction> resultPage = transactionRepository.findAll(spec, pageable);

        List<TransactionResponseDTO> content = resultPage.getContent()
                .stream()
                .map(transactionMapper::toResponseDTO)
                .collect(Collectors.toList());

        return new PageResponseDTO<>(
                content,
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages(),
                resultPage.isFirst(),
                resultPage.isLast()
        );
    }

    private boolean isValidSortField(String field) {
        return field != null && (field.equals("transactionDate") || field.equals("amount"));
    }

    /**
     * Retrieves a single transaction detail.
     */
    public TransactionResponseDTO getTransactionById(Long id) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));
        return transactionMapper.toResponseDTO(transaction);
    }

    /**
     * Updates an existing transaction.
     */
    @Transactional
    public TransactionResponseDTO updateTransaction(Long id, TransactionRequestDTO dto) {
        Transaction existing = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with ID: " + id));

        existing.setAmount(dto.getAmount());
        existing.setType(dto.getType());
        existing.setCategory(dto.getCategory());
        existing.setDescription(dto.getDescription());
        existing.setTransactionDate(dto.getTransactionDate());
        existing.setPaymentMethod(dto.getPaymentMethod());

        if (!existing.getUser().getId().equals(dto.getUserId())) {
            User newUser = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + dto.getUserId()));
            existing.setUser(newUser);
        }

        return transactionMapper.toResponseDTO(transactionRepository.save(existing));
    }

    /**
     * Deletes a transaction record.
     */
    @Transactional
    public void deleteTransaction(Long id) {
        if (!transactionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Cannot delete. Transaction not found with ID: " + id);
        }
        transactionRepository.deleteById(id);
    }
}