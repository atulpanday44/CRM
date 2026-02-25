package com.crm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesActivityDto {
    private Long id;
    private Long user;
    @JsonProperty("user_detail")
    private UserDto userDetail;
    private Long client;
    @JsonProperty("client_name")
    private String clientName;
    @JsonProperty("activity_type")
    private String activityType;
    private LocalDate date;
    private String notes;
    private BigDecimal value;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
