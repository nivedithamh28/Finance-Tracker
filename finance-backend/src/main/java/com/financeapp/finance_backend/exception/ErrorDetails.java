package com.financeapp.finance_backend.exception;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

// ErrorDetails.java
@Data
@AllArgsConstructor
public class ErrorDetails {
    private LocalDateTime timestamp;
    private String message;
    private String details;
}