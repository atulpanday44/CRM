package com.crm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private Long assignedTo;
    @JsonProperty("assigned_to_detail")
    private UserMinimalDto assignedToDetail;
    private Long createdBy;
    @JsonProperty("created_by_detail")
    private UserMinimalDto createdByDetail;
    private LocalDate deadline;
    private Integer progress;
    private List<TaskNoteDto> notes;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
    @JsonProperty("completed_at")
    private LocalDateTime completedAt;
    @JsonProperty("is_overdue")
    private Boolean isOverdue;
}
