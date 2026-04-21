package com.financeapp.finance_backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.financeapp.finance_backend.dto.AuthResponse;
import com.financeapp.finance_backend.dto.RegisterRequestDTO;
import com.financeapp.finance_backend.dto.UserProfileDTO;
import com.financeapp.finance_backend.model.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toEntity(RegisterRequestDTO request);
    
    // We don't map password back to the response for security
    @Mapping(target = "token", ignore = true)
    @Mapping(target = "message", ignore = true)
    AuthResponse toAuthResponse(User user);

    UserProfileDTO toUserProfile(User user);
}