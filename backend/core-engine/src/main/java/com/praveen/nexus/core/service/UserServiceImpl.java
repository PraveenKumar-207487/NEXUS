package com.praveen.nexus.core.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import com.praveen.nexus.core.dto.UserRequest;
import com.praveen.nexus.core.dto.UserResponse;
import com.praveen.nexus.core.exception.UserAlreadyExistsException;
import com.praveen.nexus.core.model.User;
import com.praveen.nexus.core.repository.UserRepository;
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public String getDatabaseInfo() {

        return "Database = " + mongoTemplate.getDb().getName()
                + "\nCollection = " + mongoTemplate.getCollectionName(User.class)
                + "\nCollections = "
                + mongoTemplate.getDb().listCollectionNames().into(new java.util.ArrayList<>());
    }

    @Override
    public UserResponse saveUser(UserRequest request) {

        
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new UserAlreadyExistsException("Email already exists");
    }

    User user = new User();

    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setPassword(request.getPassword());
    user.setRole(request.getRole());
    user.setCreatedAt(LocalDateTime.now());

    User savedUser = userRepository.save(user);

    return mapToResponse(savedUser);
    }

    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<UserResponse> getUserById(String id) {

        return userRepository.findById(id)
                .map(this::mapToResponse);
    }

    @Override
    public UserResponse updateUser(String id, UserRequest request) {

        Optional<User> existingUser = userRepository.findById(id);

        if (existingUser.isPresent()) {

            User user = existingUser.get();

            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setRole(request.getRole());

            User updatedUser = userRepository.save(user);

            return mapToResponse(updatedUser);
        }

        return null;
    }

    @Override
    public boolean deleteUser(String id) {

        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }

        return false;
    }

    // Helper Method
    private UserResponse mapToResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt());
    }
}