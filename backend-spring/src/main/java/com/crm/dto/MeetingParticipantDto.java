package com.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingParticipantDto {
    private Long id;
    private Long user;
    private UserMinimalDto userDetail;
    private Boolean attended;
}
