package com.praveen.nexus.core.service;

import java.util.List;
import java.util.Optional;

import com.praveen.nexus.core.dto.LoginRequest;
import com.praveen.nexus.core.dto.LoginResponse;
import com.praveen.nexus.core.dto.RegisterRequest;
import com.praveen.nexus.core.dto.UserRequest;
import com.praveen.nexus.core.dto.UserResponse;

public interface UserService {

    UserResponse saveUser(UserRequest request);

    UserResponse registerUser(RegisterRequest request);

    List<UserResponse> getAllUsers();

    List<UserResponse> getAllUsers(String authenticatedEmail);

    Optional<UserResponse> getUserById(String id);

    Optional<UserResponse> getUserById(String id, String authenticatedEmail);

    UserResponse updateUser(String id, UserRequest request);

    UserResponse updateUser(String id, String authenticatedEmail, UserRequest request);

    boolean deleteUser(String id);

    boolean deleteUser(String id, String authenticatedEmail);

    String getDatabaseInfo();

    LoginResponse login(LoginRequest request);
}