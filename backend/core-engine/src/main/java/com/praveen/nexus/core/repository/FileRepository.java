package com.praveen.nexus.core.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.praveen.nexus.core.model.UserFile;
public interface FileRepository extends MongoRepository<UserFile, String> {

    List<UserFile> findByUserIdOrderByUploadedAtDesc(String userId);

    Optional<UserFile> findByIdAndUserId(String id, String userId);
}