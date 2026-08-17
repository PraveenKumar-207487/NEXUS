package com.praveen.nexus.core.service;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.praveen.nexus.core.model.UserFile;
import com.praveen.nexus.core.repository.FileRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final FileRepository fileRepository;

    private final Path uploadDirectory =
            Paths.get("uploads");
    @Override
public UserFile getMyFile(String id, String userId) {

    return fileRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new RuntimeException("File not found"));
}
@Override
public byte[] downloadFile(String id, String userId) throws IOException {

    UserFile userFile = fileRepository.findByIdAndUserId(id, userId)
            .orElseThrow(() -> new RuntimeException("File not found"));

    Path path = Paths.get(userFile.getFilePath());

    if (!Files.exists(path)) {
        throw new RuntimeException("Physical file not found");
    }

    return Files.readAllBytes(path);
}

    @Override
    public UserFile uploadFile(MultipartFile file, String userId)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        Files.createDirectories(uploadDirectory);

        String originalName = file.getOriginalFilename();

        if (originalName == null || originalName.isBlank()) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String storedName =
                UUID.randomUUID() + "_" + originalName;

        Path targetPath =
                uploadDirectory.resolve(storedName);

        Files.copy(
                file.getInputStream(),
                targetPath,
                StandardCopyOption.REPLACE_EXISTING
        );

        UserFile userFile = new UserFile();

        userFile.setUserId(userId);
        userFile.setOriginalFileName(originalName);
        userFile.setStoredFileName(storedName);
        userFile.setFileType(file.getContentType());
        userFile.setFileSize(file.getSize());
        userFile.setFilePath(targetPath.toString());
        userFile.setUploadedAt(LocalDateTime.now());

        return fileRepository.save(userFile);
    }

    @Override
    public List<UserFile> getUserFiles(String userId) {
        return fileRepository.findByUserIdOrderByUploadedAtDesc(userId);
    }

    @Override
    public void deleteFile(String fileId, String userId)
            throws IOException {

        UserFile file = fileRepository
                .findByIdAndUserId(fileId, userId)
                .orElseThrow(() ->
                        new RuntimeException("File not found"));

        Path path = Paths.get(file.getFilePath());

        Files.deleteIfExists(path);

        fileRepository.delete(file);
    }
}