package com.crm.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskCreateDto {
    private String title;
    private String description;
    private String status;
    private String priority;
    @JsonAlias("assigned_to")
    private Long assignedTo;
    private LocalDate deadline;
    private Integer progress;
}
