package com.praveen.nexus.core.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.core.dto.ApiResponse;
import com.praveen.nexus.core.dto.LoginRequest;
import com.praveen.nexus.core.dto.LoginResponse;
import com.praveen.nexus.core.dto.UserRequest;
import com.praveen.nexus.core.dto.UserResponse;
import com.praveen.nexus.core.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Create User
    @PostMapping
    public ApiResponse<UserResponse> saveUser(@Valid @RequestBody UserRequest request) {

        UserResponse savedUser = userService.saveUser(request);

        return new ApiResponse<>(
                true,
                "User Created Successfully",
                savedUser
        );
    }

    // Get All Users
    @GetMapping
    public ApiResponse<List<UserResponse>> getAllUsers() {

        List<UserResponse> users = userService.getAllUsers();

        return new ApiResponse<>(
                true,
                "Users Retrieved Successfully",
                users
        );
    }

    // Get User By Id
    @GetMapping("/{id}")
    public ApiResponse<?> getUserById(@PathVariable String id) {

        Optional<UserResponse> user = userService.getUserById(id);

        if (user.isPresent()) {

            return new ApiResponse<>(
                    true,
                    "User Found",
                    user.get()
            );
        }

        return new ApiResponse<>(
                false,
                "User Not Found",
                null
        );
    }

    // Update User
    @PutMapping("/{id}")
    public ApiResponse<?> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserRequest request) {

        UserResponse updatedUser = userService.updateUser(id, request);

        if (updatedUser != null) {

            return new ApiResponse<>(
                    true,
                    "User Updated Successfully",
                    updatedUser
            );
        }

        return new ApiResponse<>(
                false,
                "User Not Found",
                null
        );
    }

    // Delete User
    @DeleteMapping("/{id}")
    public ApiResponse<?> deleteUser(@PathVariable String id) {

        boolean deleted = userService.deleteUser(id);

        if (deleted) {

            return new ApiResponse<>(
                    true,
                    "User Deleted Successfully",
                    null
            );
        }

        return new ApiResponse<>(
                false,
                "User Not Found",
                null
        );
    }

    @GetMapping("/dbinfo")
    public String databaseInfo() {
        return userService.getDatabaseInfo();
    }
    @PostMapping("/login")
public ResponseEntity<ApiResponse<LoginResponse>> login(
        @Valid @RequestBody LoginRequest request) {

    LoginResponse response = userService.login(request);

    return ResponseEntity.ok(
            new ApiResponse<>(
                    true,
                    "Login successful",
                    response
            )
    );
}
}