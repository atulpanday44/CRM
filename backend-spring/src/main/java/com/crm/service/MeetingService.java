package com.crm.service;

import com.crm.domain.Meeting;
import com.crm.domain.MeetingParticipant;
import com.crm.domain.User;
import com.crm.dto.*;
import com.crm.repository.MeetingRepository;
import com.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<MeetingDto> listMeetings(User current) {
        List<Meeting> meetings = current.isAdminOrHr()
                ? meetingRepository.findAllByOrderByScheduledAtDesc()
                : meetingRepository.findMeetingsForUser(current.getId());
        return meetings.stream().map(this::toDto).collect(Collectors.toList());
    }

    public MeetingDto getMeeting(Long id, User current) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found."));
        if (!current.isAdminOrHr() && !isParticipantOrCreator(meeting, current)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to view this meeting.");
        }
        return toDto(meeting);
    }

    @Transactional
    public MeetingDto createMeeting(MeetingCreateDto dto, User current) {
        Meeting meeting = Meeting.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .scheduledAt(dto.getScheduledAt())
                .location(dto.getLocation())
                .status("scheduled")
                .createdBy(current)
                .notes(dto.getNotes())
                .decisions(dto.getDecisions())
                .followUpActions(dto.getFollowUpActions())
                .build();
        Meeting saved = meetingRepository.save(meeting);
        if (dto.getParticipantIds() != null) {
            final Meeting m = saved;
            for (Long userId : dto.getParticipantIds()) {
                userRepository.findById(userId).ifPresent(u -> {
                    MeetingParticipant p = MeetingParticipant.builder().meeting(m).user(u).build();
                    m.getParticipants().add(p);
                });
            }
            saved = meetingRepository.save(saved);
        }
        return toDto(saved);
    }

    @Transactional
    public MeetingDto updateMeeting(Long id, MeetingUpdateDto dto, User current) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found."));
        if (!current.isAdminOrHr() && !isParticipantOrCreator(meeting, current)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to update this meeting.");
        }
        if (dto.getTitle() != null) meeting.setTitle(dto.getTitle());
        if (dto.getDescription() != null) meeting.setDescription(dto.getDescription());
        if (dto.getScheduledAt() != null) meeting.setScheduledAt(dto.getScheduledAt());
        if (dto.getLocation() != null) meeting.setLocation(dto.getLocation());
        if (dto.getStatus() != null) meeting.setStatus(dto.getStatus());
        if (dto.getNotes() != null) meeting.setNotes(dto.getNotes());
        if (dto.getDecisions() != null) meeting.setDecisions(dto.getDecisions());
        if (dto.getFollowUpActions() != null) meeting.setFollowUpActions(dto.getFollowUpActions());
        if (dto.getParticipantIds() != null) {
            meeting.getParticipants().clear();
            final Meeting m = meeting;
            for (Long userId : dto.getParticipantIds()) {
                userRepository.findById(userId).ifPresent(u -> {
                    m.getParticipants().add(MeetingParticipant.builder().meeting(m).user(u).build());
                });
            }
        }
        meeting = meetingRepository.save(meeting);
        return toDto(meeting);
    }

    @Transactional
    public void deleteMeeting(Long id, User current) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meeting not found."));
        if (!current.isAdminOrHr() && meeting.getCreatedBy() != null && !meeting.getCreatedBy().getId().equals(current.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to delete this meeting.");
        }
        meetingRepository.delete(meeting);
    }

    private boolean isParticipantOrCreator(Meeting m, User u) {
        if (m.getCreatedBy() != null && m.getCreatedBy().getId().equals(u.getId())) return true;
        return m.getParticipants().stream().anyMatch(p -> p.getUser().getId().equals(u.getId()));
    }

    private UserMinimalDto toMinimal(User u) {
        if (u == null) return null;
        String name = (u.getFirstName() != null ? u.getFirstName() : "") + " " + (u.getLastName() != null ? u.getLastName() : "");
        name = name.trim().isEmpty() ? u.getUsername() : name.trim();
        return UserMinimalDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .name(name)
                .build();
    }

    private MeetingDto toDto(Meeting m) {
        List<MeetingParticipantDto> participantsList = (m.getParticipants() != null ? m.getParticipants() : List.<MeetingParticipant>of()).stream()
                .map(p -> MeetingParticipantDto.builder()
                        .id(p.getId())
                        .user(p.getUser().getId())
                        .userDetail(toMinimal(p.getUser()))
                        .attended(p.getAttended())
                        .build())
                .collect(Collectors.toList());
        return MeetingDto.builder()
                .id(m.getId())
                .title(m.getTitle())
                .description(m.getDescription())
                .scheduledAt(m.getScheduledAt())
                .location(m.getLocation())
                .status(m.getStatus())
                .createdBy(m.getCreatedBy() != null ? m.getCreatedBy().getId() : null)
                .notes(m.getNotes())
                .decisions(m.getDecisions())
                .followUpActions(m.getFollowUpActions())
                .participantsList(participantsList)
                .createdAt(m.getCreatedAt())
                .updatedAt(m.getUpdatedAt())
                .build();
    }
}
