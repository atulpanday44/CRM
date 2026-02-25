package com.crm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskNoteDto {
    private Long id;
    private Long task;
    private String content;
    private Long author;
    @JsonProperty("author_name")
    private String authorName;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
