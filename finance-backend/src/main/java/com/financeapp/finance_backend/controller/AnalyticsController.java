package com.financeapp.finance_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.financeapp.finance_backend.dto.AnalyticsSummaryDTO;
import com.financeapp.finance_backend.service.AnalyticsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    /**
     * GET /api/analytics/user/{userId}
     * Returns a full analytics summary for the given user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<AnalyticsSummaryDTO> getSummary(@PathVariable Long userId) {
        return ResponseEntity.ok(analyticsService.getSummary(userId));
    }
}
