package com.crm.controller;

import com.crm.domain.User;
import com.crm.dto.*;
import com.crm.service.MeetingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/meetings")
@RequiredArgsConstructor
public class MeetingsController {

    private final MeetingService meetingService;

    @GetMapping("/meetings")
    public List<MeetingDto> list(@AuthenticationPrincipal User current) {
        return meetingService.listMeetings(current);
    }

    @GetMapping("/meetings/{id}")
    public MeetingDto get(@PathVariable Long id, @AuthenticationPrincipal User current) {
        return meetingService.getMeeting(id, current);
    }

    @PostMapping("/meetings")
    public ResponseEntity<MeetingDto> create(@RequestBody MeetingCreateDto dto, @AuthenticationPrincipal User current) {
        MeetingDto created = meetingService.createMeeting(dto, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/meetings/{id}")
    public MeetingDto update(@PathVariable Long id, @RequestBody MeetingUpdateDto dto, @AuthenticationPrincipal User current) {
        return meetingService.updateMeeting(id, dto, current);
    }

    @DeleteMapping("/meetings/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User current) {
        meetingService.deleteMeeting(id, current);
        return ResponseEntity.noContent().build();
    }
}
