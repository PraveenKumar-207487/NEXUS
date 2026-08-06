package com.praveen.nexus.core.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.praveen.nexus.core.dto.ApiResponse;
import com.praveen.nexus.core.model.User;
import com.praveen.nexus.core.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    // Create User
    @PostMapping
    public ApiResponse<User> saveUser(@RequestBody User user) {

        User savedUser = userService.saveUser(user);

        return new ApiResponse<>(
                true,
                "User Created Successfully",
                savedUser
        );
    }

    // Get All Users
    @GetMapping
    public ApiResponse<List<User>> getAllUsers() {

        List<User> users = userService.getAllUsers();

        return new ApiResponse<>(
                true,
                "Users Retrieved Successfully",
                users
        );
    }

    // Get User By Id
    @GetMapping("/{id}")
    public ApiResponse<?> getUserById(@PathVariable String id) {

        Optional<User> user = userService.getUserById(id);

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
            @RequestBody User user) {

        User updatedUser = userService.updateUser(id, user);

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

}