package com.crm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class MeetingCreateDto {
    private String title;
    private String description;
    @JsonProperty("scheduled_at")
    private LocalDateTime scheduledAt;
    private String location;
    @JsonProperty("participant_ids")
    private List<Long> participantIds;
    private String notes;
    private String decisions;
    @JsonProperty("follow_up_actions")
    private String followUpActions;
}
