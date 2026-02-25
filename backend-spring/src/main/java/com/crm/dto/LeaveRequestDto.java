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
public class LeaveRequestDto {
    private Long id;
    private Long user;
    private UserDto userDetail;
    @JsonProperty("start_date")
    private LocalDate startDate;
    @JsonProperty("end_date")
    private LocalDate endDate;
    @JsonProperty("leave_type")
    private String leaveType;
    private String reason;
    private String status;
    @JsonProperty("duration_days")
    private Integer durationDays;
    private Long approvedBy;
    private UserDto approvedByDetail;
    @JsonProperty("approved_at")
    private LocalDateTime approvedAt;
    @JsonProperty("rejection_reason")
    private String rejectionReason;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
