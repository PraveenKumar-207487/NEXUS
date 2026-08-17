package com.praveen.nexus.core.service;
import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.praveen.nexus.core.model.UserFile;

public interface FileService {

    UserFile uploadFile(MultipartFile file, String userId) throws IOException;

    List<UserFile> getUserFiles(String userId);
    UserFile getMyFile(String id, String userId);
    byte[] downloadFile(String id, String userId) throws IOException;

    void deleteFile(String fileId, String userId) throws IOException;
}