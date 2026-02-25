package com.crm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class LeaveRequestStatusDto {
    private String status;
    @JsonProperty("rejection_reason")
    private String rejectionReason;
}
