package com.praveen.nexus.core.service;

import java.util.List;
import java.util.Optional;

import com.praveen.nexus.core.dto.UserRequest;
import com.praveen.nexus.core.dto.UserResponse;

public interface UserService {

    UserResponse saveUser(UserRequest request);

    List<UserResponse> getAllUsers();

    Optional<UserResponse> getUserById(String id);

    UserResponse updateUser(String id, UserRequest request);

    boolean deleteUser(String id);

    String getDatabaseInfo();
}