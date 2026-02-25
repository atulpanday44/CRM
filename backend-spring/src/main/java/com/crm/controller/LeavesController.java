package com.crm.controller;

import com.crm.domain.User;
import com.crm.dto.*;
import com.crm.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
public class LeavesController {

    private final LeaveService leaveService;

    @GetMapping("/requests")
    public List<LeaveRequestDto> list(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long user,
            @AuthenticationPrincipal User current
    ) {
        return leaveService.listLeaveRequests(current, status, user);
    }

    @GetMapping("/requests/my_leaves")
    public List<LeaveRequestDto> myLeaves(@AuthenticationPrincipal User current) {
        return leaveService.myLeaves(current);
    }

    @GetMapping("/requests/pending")
    public List<LeaveRequestDto> pending(@AuthenticationPrincipal User current) {
        return leaveService.pending(current);
    }

    @GetMapping("/requests/{id}")
    public LeaveRequestDto get(@PathVariable Long id, @AuthenticationPrincipal User current) {
        return leaveService.getLeaveRequest(id, current);
    }

    @PostMapping("/requests")
    public ResponseEntity<LeaveRequestDto> create(@RequestBody LeaveRequestCreateDto dto, @AuthenticationPrincipal User current) {
        LeaveRequestDto created = leaveService.createLeaveRequest(dto, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/requests/{id}")
    public LeaveRequestDto update(@PathVariable Long id, @RequestBody LeaveRequestUpdateDto dto, @AuthenticationPrincipal User current) {
        return leaveService.updateLeaveRequest(id, dto, current);
    }

    @DeleteMapping("/requests/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User current) {
        leaveService.deleteLeaveRequest(id, current);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/requests/{id}/update_status")
    public LeaveRequestDto updateStatus(@PathVariable Long id, @RequestBody LeaveRequestStatusDto dto, @AuthenticationPrincipal User current) {
        return leaveService.updateStatus(id, dto, current);
    }
}
