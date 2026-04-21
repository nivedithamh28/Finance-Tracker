package com.financeapp.finance_backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic paginated response wrapper.
 * Carries content + Spring Page metadata in a frontend-friendly shape.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponseDTO<T> {
    private List<T> content;
    private int pageNumber;    // 0-based current page
    private int pageSize;      // items per page
    private long totalElements; // total records across all pages
    private int totalPages;    // total pages available
    private boolean first;     // is this the first page?
    private boolean last;      // is this the last page?
}
