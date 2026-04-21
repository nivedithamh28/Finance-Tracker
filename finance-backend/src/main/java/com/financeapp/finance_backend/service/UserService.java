package com.financeapp.finance_backend.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.financeapp.finance_backend.dto.PasswordUpdateDTO;
import com.financeapp.finance_backend.dto.UserProfileDTO;
import com.financeapp.finance_backend.dto.UserProfileUpdateDTO;
import com.financeapp.finance_backend.exception.ResourceNotFoundException;
import com.financeapp.finance_backend.mapper.UserMapper;
import com.financeapp.finance_backend.model.User;
import com.financeapp.finance_backend.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserProfileDTO getProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return userMapper.toUserProfile(user);
    }

    @Transactional
    public UserProfileDTO updateProfile(Long id, UserProfileUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        
        user.setFullName(dto.getFullName());
        user.setCurrencyPreference(dto.getCurrencyPreference());
        user.setMonthlyIncome(dto.getMonthlyIncome());
        
        return userMapper.toUserProfile(userRepository.save(user));
    }

    @Transactional
    public void updatePassword(Long id, PasswordUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }
}
