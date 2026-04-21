package com.financeapp.finance_backend.mapper;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

import com.financeapp.finance_backend.dto.TransactionRequestDTO;
import com.financeapp.finance_backend.dto.TransactionResponseDTO;
import com.financeapp.finance_backend.model.Transaction;

@Component
public class TransactionMapper {
    
    public Transaction toEntity(TransactionRequestDTO dto) {
        Transaction entity = new Transaction();
        BeanUtils.copyProperties(dto, entity);
        // User is set separately in the Service
        return entity;
    }

    public TransactionResponseDTO toResponseDTO(Transaction entity) {
        TransactionResponseDTO dto = new TransactionResponseDTO();
        BeanUtils.copyProperties(entity, dto);
        
        // Extract the ID from the User object to the DTO
        if (entity.getUser() != null) {
            dto.setUserId(entity.getUser().getId());
        }
        return dto;
    }
}