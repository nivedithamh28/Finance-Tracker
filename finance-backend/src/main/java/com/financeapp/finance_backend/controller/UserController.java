package com.financeapp.finance_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.financeapp.finance_backend.dto.PasswordUpdateDTO;
import com.financeapp.finance_backend.dto.UserProfileDTO;
import com.financeapp.finance_backend.dto.UserProfileUpdateDTO;
import com.financeapp.finance_backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<UserProfileDTO> updateProfile(@PathVariable Long id, @Valid @RequestBody UserProfileUpdateDTO dto) {
        return ResponseEntity.ok(userService.updateProfile(id, dto));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<String> updatePassword(@PathVariable Long id, @Valid @RequestBody PasswordUpdateDTO dto) {
        userService.updatePassword(id, dto);
        return ResponseEntity.ok("Password updated successfully");
    }
}
