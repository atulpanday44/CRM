package com.crm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientDto {
    private Long id;
    @JsonProperty("client_name")
    private String clientName;
    @JsonProperty("company_name")
    private String companyName;
    private String email;
    @JsonProperty("contact_no")
    private String contactNo;
    private String address;
    private String country;
    private String status;
    @JsonProperty("deal_value")
    private BigDecimal dealValue;
    @JsonProperty("entry_date")
    private LocalDate entryDate;
    @JsonProperty("closed_date")
    private LocalDate closedDate;
    @JsonProperty("next_follow_up")
    private LocalDate nextFollowUp;
    private Long assignedTo;
    @JsonProperty("assigned_to_detail")
    private UserDto assignedToDetail;
    private String comments;
    @JsonProperty("team_id")
    private String teamId;
    private List<ClientServiceDto> services;
    @JsonProperty("service_ids")
    private List<Long> serviceIds;
    @JsonProperty("created_at")
    private LocalDateTime createdAt;
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;
}
