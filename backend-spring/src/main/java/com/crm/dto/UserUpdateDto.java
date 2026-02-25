package com.crm.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserUpdateDto {
    private String username;
    private String email;
    @JsonProperty("first_name")
    private String firstName;
    @JsonProperty("last_name")
    private String lastName;
    private String role;
    private String department;
    private String phone;
    private String address;
    private LocalDate dob;
    private LocalDate doj;
    private Integer age;
    @JsonProperty("is_active")
    private Boolean active;
}
