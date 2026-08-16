
package com.praveen.nexus.core.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.praveen.nexus.core.dto.LoginRequest;
import com.praveen.nexus.core.dto.LoginResponse;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Override
    public String getDatabaseInfo() {

        return "Database = " + mongoTemplate.getDb().getName()
                + "\nCollection = " + mongoTemplate.getCollectionName(User.class)
                + "\nCollections = "
                + mongoTemplate.getDb().listCollectionNames()
                        .into(new java.util.ArrayList<>());
    }

    @Override
    public UserResponse saveUser(UserRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        // Hash password before storing in MongoDB
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
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
    public List<UserResponse> getAllUsers(String authenticatedEmail) {

        User requester = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Access denied"));

        if (!"ADMIN".equalsIgnoreCase(requester.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied");
        }

        return getAllUsers();
    }

    @Override
    public Optional<UserResponse> getUserById(String id) {

        return userRepository.findById(id)
                .map(this::mapToResponse);
    }

    @Override
    public Optional<UserResponse> getUserById(String id, String authenticatedEmail) {

        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

        User requester = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Access denied"));

        if ("ADMIN".equalsIgnoreCase(requester.getRole())) {
            return Optional.of(mapToResponse(targetUser));
        }

        if (targetUser.getEmail() != null
                && targetUser.getEmail().equalsIgnoreCase(authenticatedEmail)) {
            return Optional.of(mapToResponse(targetUser));
        }

        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You are not allowed to access this user");
    }

    @Override
    public UserResponse updateUser(String id, UserRequest request) {

        Optional<User> existingUser = userRepository.findById(id);

        if (existingUser.isPresent()) {

            User user = existingUser.get();

            user.setName(request.getName());
            user.setEmail(request.getEmail());

            user.setPassword(
                    passwordEncoder.encode(request.getPassword())
            );

            user.setRole(request.getRole());

            User updatedUser = userRepository.save(user);

            return mapToResponse(updatedUser);
        }

        return null;
    }

    @Override
    public UserResponse updateUser(String id, String authenticatedEmail, UserRequest request) {

        User requester = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Access denied"));

        if (!"ADMIN".equalsIgnoreCase(requester.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied");
        }

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found"));

        existingUser.setName(request.getName());
        existingUser.setEmail(request.getEmail());
        existingUser.setPassword(passwordEncoder.encode(request.getPassword()));
        existingUser.setRole(request.getRole());

        User updatedUser = userRepository.save(existingUser);

        return mapToResponse(updatedUser);
    }

    @Override
    public boolean deleteUser(String id) {

        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }

        return false;
    }

    @Override
    public boolean deleteUser(String id, String authenticatedEmail) {

        User requester = userRepository.findByEmail(authenticatedEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Access denied"));

        if (!"ADMIN".equalsIgnoreCase(requester.getRole())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied");
        }

        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "User not found");
        }

        userRepository.deleteById(id);
        return true;
    }

    private UserResponse mapToResponse(User user) {

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt());
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BadCredentialsException("Invalid email or password"));

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtService.generateToken(
                user.getEmail(),
                user.getRole()
        );

        return new LoginResponse(
                "Login successful",
                user.getEmail(),
                user.getRole(),
                token
        );
    }
}
