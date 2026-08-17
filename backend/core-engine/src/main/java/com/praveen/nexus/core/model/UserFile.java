package com.praveen.nexus.core.model;
import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "files")
public class UserFile {
     @Id
    private String id;

    private String userId;
    private String originalFileName;
    private String storedFileName;
    private String fileType;
    private long fileSize;
    private String filePath;
    private LocalDateTime uploadedAt;
}
