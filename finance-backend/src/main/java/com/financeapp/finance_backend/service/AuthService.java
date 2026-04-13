package com.financeapp.finance_backend.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.financeapp.finance_backend.dto.AuthResponse;
import com.financeapp.finance_backend.dto.LoginRequest;
import com.financeapp.finance_backend.dto.RegisterRequestDTO;
import com.financeapp.finance_backend.mapper.UserMapper;
import com.financeapp.finance_backend.model.User;
import com.financeapp.finance_backend.repository.UserRepository;
import com.financeapp.finance_backend.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public String register(RegisterRequestDTO request) {
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return "User registered successfully";
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user.getEmail());
        AuthResponse response = userMapper.toAuthResponse(user);
        response.setToken(token);
        return response;
    }
}