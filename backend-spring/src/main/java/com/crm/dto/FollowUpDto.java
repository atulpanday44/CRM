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
public class FollowUpDto {
    private Long id;
    private Long client;
    @JsonProperty("client_name")
    private String clientName;
    private LocalDate date;
    private String notes;
    private Boolean done;
    private Long createdBy;
    @JsonProperty("created_by_detail")
    private UserDto createdByDetail;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
