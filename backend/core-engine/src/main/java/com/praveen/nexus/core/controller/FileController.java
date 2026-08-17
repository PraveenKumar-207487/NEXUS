package com.praveen.nexus.core.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.praveen.nexus.core.model.UserFile;
import com.praveen.nexus.core.service.FileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    // Upload file
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws IOException {

        String userId = authentication.getName();

        UserFile savedFile =
                fileService.uploadFile(file, userId);

        return ResponseEntity.ok(savedFile);
    }

    // Get all files belonging to logged-in user
    @GetMapping
    public ResponseEntity<List<UserFile>> getFiles(
            Authentication authentication) {

        String userId = authentication.getName();

        return ResponseEntity.ok(
                fileService.getUserFiles(userId)
        );
    }

    // Get one file's metadata
    @GetMapping("/{id}")
    public ResponseEntity<?> getMyFile(
            @PathVariable String id,
            Authentication authentication) {

        String userId = authentication.getName();

        return ResponseEntity.ok(
                fileService.getMyFile(id, userId)
        );
    }
    @GetMapping("/{id}/download")
public ResponseEntity<byte[]> downloadFile(
        @PathVariable String id,
        Authentication authentication) throws IOException {

    String userId = authentication.getName();

    UserFile userFile = fileService.getMyFile(id, userId);

    byte[] fileData = fileService.downloadFile(id, userId);

    return ResponseEntity.ok()
            .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"" +
                            userFile.getOriginalFileName() + "\""
            )
            .contentType(
                    MediaType.APPLICATION_OCTET_STREAM
            )
            .body(fileData);
}
    // Delete file
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFile(
            @PathVariable String id,
            Authentication authentication)
            throws IOException {

        String userId = authentication.getName();

        fileService.deleteFile(id, userId);

        return ResponseEntity.ok(
                Map.of(
                        "message",
                        "File deleted successfully"
                )
        );
    }
}