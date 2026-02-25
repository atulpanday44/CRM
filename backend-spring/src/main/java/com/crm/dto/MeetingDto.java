package com.crm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingDto {
    private Long id;
    private String title;
    private String description;
    @JsonProperty("scheduled_at")
    private LocalDateTime scheduledAt;
    private String location;
    private String status;
    private Long createdBy;
    private String notes;
    private String decisions;
    @JsonProperty("follow_up_actions")
    private String followUpActions;
    @JsonProperty("participants_list")
    private List<MeetingParticipantDto> participantsList;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
