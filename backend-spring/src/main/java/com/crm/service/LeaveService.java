package com.crm.service;

import com.crm.domain.LeaveRequest;
import com.crm.domain.User;
import com.crm.dto.*;
import com.crm.repository.LeaveRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final UserService userService;

    private UserDto toUserDto(User u) {
        if (u == null) return null;
        return UserDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .role(u.getRole())
                .department(u.getDepartment())
                .phone(u.getPhone())
                .address(u.getAddress())
                .dob(u.getDob())
                .doj(u.getDoj())
                .age(u.getAge())
                .active(u.getActive())
                .dateJoined(u.getDateJoined())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestDto> listLeaveRequests(User current, String statusFilter, Long userId) {
        List<LeaveRequest> list;
        if (current.isAdminOrHr()) {
            list = statusFilter != null
                    ? leaveRequestRepository.findByStatusOrderByCreatedAtDesc(statusFilter)
                    : leaveRequestRepository.findAllByOrderByCreatedAtDesc();
            if (userId != null) {
                list = list.stream().filter(lr -> lr.getUser().getId().equals(userId)).collect(Collectors.toList());
            }
        } else {
            list = leaveRequestRepository.findByUserIdOrderByCreatedAtDesc(current.getId());
            if (statusFilter != null) {
                list = list.stream().filter(lr -> statusFilter.equals(lr.getStatus())).collect(Collectors.toList());
            }
        }
        return list.stream().map(lr -> toDto(lr)).collect(Collectors.toList());
    }

    public LeaveRequestDto getLeaveRequest(Long id, User current) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave request not found."));
        if (!current.isAdminOrHr() && !lr.getUser().getId().equals(current.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to view this leave request.");
        }
        return toDto(lr);
    }

    @Transactional
    public LeaveRequestDto createLeaveRequest(LeaveRequestCreateDto dto, User current) {
        validateDates(dto.getStartDate(), dto.getEndDate(), true);
        LeaveRequest lr = LeaveRequest.builder()
                .user(current)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .leaveType(dto.getLeaveType() != null ? dto.getLeaveType() : "Paid Leave")
                .reason(dto.getReason())
                .status("pending")
                .build();
        lr = leaveRequestRepository.save(lr);
        return toDto(lr);
    }

    @Transactional
    public LeaveRequestDto updateLeaveRequest(Long id, LeaveRequestUpdateDto dto, User current) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave request not found."));
        if (!lr.getUser().getId().equals(current.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own leave requests.");
        }
        if (!"pending".equals(lr.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending leave requests can be updated.");
        }
        validateDates(dto.getStartDate(), dto.getEndDate(), false);
        if (dto.getStartDate() != null) lr.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null) lr.setEndDate(dto.getEndDate());
        if (dto.getLeaveType() != null) lr.setLeaveType(dto.getLeaveType());
        if (dto.getReason() != null) lr.setReason(dto.getReason());
        lr = leaveRequestRepository.save(lr);
        return toDto(lr);
    }

    @Transactional
    public void deleteLeaveRequest(Long id, User current) {
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave request not found."));
        if (!lr.getUser().getId().equals(current.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own leave requests.");
        }
        if (!"pending".equals(lr.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending leave requests can be deleted.");
        }
        leaveRequestRepository.delete(lr);
    }

    @Transactional
    public LeaveRequestDto updateStatus(Long id, LeaveRequestStatusDto dto, User current) {
        if (!current.isAdminOrHr()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to approve/reject leave requests.");
        }
        LeaveRequest lr = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Leave request not found."));
        if (!"pending".equals(lr.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending leave requests can have their status changed.");
        }
        if ("rejected".equals(dto.getStatus()) && (dto.getRejectionReason() == null || dto.getRejectionReason().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rejection reason is required when rejecting a leave request.");
        }
        lr.setStatus(dto.getStatus());
        lr.setRejectionReason(dto.getRejectionReason());
        if ("approved".equals(dto.getStatus()) || "rejected".equals(dto.getStatus())) {
            lr.setApprovedBy(current);
            lr.setApprovedAt(LocalDateTime.now());
        }
        lr = leaveRequestRepository.save(lr);
        return toDto(lr);
    }

    public List<LeaveRequestDto> myLeaves(User current) {
        return leaveRequestRepository.findByUserIdOrderByCreatedAtDesc(current.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<LeaveRequestDto> pending(User current) {
        if (!current.isAdminOrHr()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view pending leave requests.");
        }
        return leaveRequestRepository.findByStatusOrderByCreatedAtDesc("pending")
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    private void validateDates(LocalDate start, LocalDate end, boolean notInPast) {
        if (start == null || end == null) return;
        if (end.isBefore(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "End date cannot be before start date.");
        }
        if (notInPast && start.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date cannot be in the past.");
        }
    }

    private LeaveRequestDto toDto(LeaveRequest lr) {
        return LeaveRequestDto.builder()
                .id(lr.getId())
                .user(lr.getUser().getId())
                .userDetail(toUserDto(lr.getUser()))
                .startDate(lr.getStartDate())
                .endDate(lr.getEndDate())
                .leaveType(lr.getLeaveType())
                .reason(lr.getReason())
                .status(lr.getStatus())
                .durationDays(lr.getDurationDays())
                .approvedBy(lr.getApprovedBy() != null ? lr.getApprovedBy().getId() : null)
                .approvedByDetail(toUserDto(lr.getApprovedBy()))
                .approvedAt(lr.getApprovedAt())
                .rejectionReason(lr.getRejectionReason())
                .createdAt(lr.getCreatedAt())
                .updatedAt(lr.getUpdatedAt())
                .build();
    }
}
