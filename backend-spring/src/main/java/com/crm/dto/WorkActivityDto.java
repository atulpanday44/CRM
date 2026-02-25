package com.crm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkActivityDto {
    private Long id;
    private Long user;
    @JsonProperty("user_name")
    private String userName;
    @JsonProperty("activity_type")
    private String activityType;
    private String content;
    private LocalDate date;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
