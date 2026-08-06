package com.praveen.nexus.core.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import com.praveen.nexus.core.model.User;
import com.praveen.nexus.core.repository.UserRepository;
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
   @Autowired
private MongoTemplate mongoTemplate;

public String getDatabaseInfo() {

    return "Database = " + mongoTemplate.getDb().getName()
            + "\nCollection = " + mongoTemplate.getCollectionName(User.class)
            + "\nCollections = " + mongoTemplate.getDb().listCollectionNames().into(new java.util.ArrayList<>());
}

    // Save User
    public User saveUser(User user) {
         user.setCreatedAt(LocalDateTime.now());

    User savedUser = userRepository.save(user);

    System.out.println("====================================");
    System.out.println("Saved User ID      : " + savedUser.getId());
    System.out.println("Saved User Name    : " + savedUser.getName());
    System.out.println("Saved User Email   : " + savedUser.getEmail());
    System.out.println("====================================");

    return savedUser;
    }

    // Get All Users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get User By Id
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    // Update User
    public User updateUser(String id, User updatedUser) {

        Optional<User> existingUser = userRepository.findById(id);

        if (existingUser.isPresent()) {

            User user = existingUser.get();

            user.setName(updatedUser.getName());
            user.setEmail(updatedUser.getEmail());
            user.setPassword(updatedUser.getPassword());
            user.setRole(updatedUser.getRole());

            return userRepository.save(user);
        }

        return null;
    }
     // Delete User
    public boolean deleteUser(String id) {

        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return true;
        }

        return false;
    }
}