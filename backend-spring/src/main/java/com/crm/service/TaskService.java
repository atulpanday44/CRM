package com.crm.service;

import com.crm.domain.Task;
import com.crm.domain.TaskNote;
import com.crm.domain.User;
import com.crm.domain.WorkActivity;
import com.crm.dto.*;
import com.crm.repository.TaskRepository;
import com.crm.repository.UserRepository;
import com.crm.repository.WorkActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WorkActivityRepository workActivityRepository;

    @Transactional(readOnly = true)
    public List<TaskDto> listTasks(User current) {
        List<Task> tasks = current.isAdminOrHr()
                ? taskRepository.findAllByOrderByCreatedAtDesc()
                : taskRepository.findByAssignedToOrderByCreatedAtDesc(current);
        return tasks.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDto getTask(Long id, User current) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found."));
        if (!current.isAdminOrHr() && !task.getAssignedTo().getId().equals(current.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view your own tasks.");
        }
        return toDto(task);
    }

    @Transactional
    public TaskDto createTask(TaskCreateDto dto, User current) {
        if (!current.isAdminOrHr()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin/HR can assign tasks.");
        }
        User assignedTo = userRepository.findById(dto.getAssignedTo())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid assigned_to user."));
        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus() != null ? dto.getStatus() : "pending")
                .priority(dto.getPriority() != null ? dto.getPriority() : "medium")
                .assignedTo(assignedTo)
                .createdBy(current)
                .deadline(dto.getDeadline())
                .progress(dto.getProgress() != null ? dto.getProgress() : 0)
                .build();
        task = taskRepository.save(task);
        return toDto(task);
    }

    @Transactional
    public TaskDto updateTask(Long id, TaskUpdateDto dto, User current) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found."));
        if (!task.getAssignedTo().getId().equals(current.getId()) && !current.isAdminOrHr()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own tasks.");
        }
        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        if (dto.getAssignedTo() != null && current.isAdminOrHr()) {
            User assigned = userRepository.findById(dto.getAssignedTo()).orElse(task.getAssignedTo());
            task.setAssignedTo(assigned);
        }
        if (dto.getDeadline() != null) task.setDeadline(dto.getDeadline());
        if (dto.getProgress() != null) task.setProgress(dto.getProgress());
        if ("completed".equals(task.getStatus())) {
            task.setCompletedAt(LocalDateTime.now());
            task.setProgress(100);
        }
        task = taskRepository.save(task);
        return toDto(task);
    }

    @Transactional
    public void deleteTask(Long id, User current) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found."));
        if (!current.isAdminOrHr()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admin/HR can delete tasks.");
        }
        taskRepository.delete(task);
    }

    @Transactional
    public TaskNoteDto addNote(Long taskId, String content, User current) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Task not found."));
        if (!task.getAssignedTo().getId().equals(current.getId()) && !current.isAdminOrHr()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only add notes to your own tasks.");
        }
        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content is required.");
        }
        TaskNote note = TaskNote.builder()
                .task(task)
                .author(current)
                .content(content.trim())
                .build();
        task.getNotes().add(note);
        taskRepository.save(task);
        return toNoteDto(note);
    }

    public List<WorkActivityDto> listActivities(User current, Long userId) {
        if (userId != null && current.isAdminOrHr()) {
            return workActivityRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId)
                    .stream().map(this::toActivityDto).collect(Collectors.toList());
        }
        if (current.isAdminOrHr()) {
            return workActivityRepository.findAllByOrderByDateDescCreatedAtDesc()
                    .stream().map(this::toActivityDto).collect(Collectors.toList());
        }
        return workActivityRepository.findByUserIdOrderByDateDescCreatedAtDesc(current.getId())
                .stream().map(this::toActivityDto).collect(Collectors.toList());
    }

    @Transactional
    public WorkActivityDto createActivity(WorkActivityDto dto, User current) {
        WorkActivity activity = WorkActivity.builder()
                .user(current)
                .activityType(dto.getActivityType() != null ? dto.getActivityType() : "daily")
                .content(dto.getContent())
                .date(dto.getDate())
                .build();
        activity = workActivityRepository.save(activity);
        return toActivityDto(activity);
    }

    private static String userName(User u) {
        if (u == null) return null;
        String full = (u.getFirstName() != null ? u.getFirstName() : "") + " " + (u.getLastName() != null ? u.getLastName() : "").trim();
        return full.isEmpty() ? u.getUsername() : full.trim();
    }

    private UserMinimalDto toMinimal(User u) {
        if (u == null) return null;
        return UserMinimalDto.builder()
                .id(u.getId())
                .username(u.getUsername())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .name(userName(u))
                .department(u.getDepartment())
                .build();
    }

    private TaskNoteDto toNoteDto(TaskNote n) {
        return TaskNoteDto.builder()
                .id(n.getId())
                .task(n.getTask().getId())
                .content(n.getContent())
                .author(n.getAuthor().getId())
                .authorName(n.getAuthor().getUsername())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private TaskDto toDto(Task t) {
        var notes = t.getNotes() != null ? t.getNotes().stream().map(this::toNoteDto).collect(Collectors.toList()) : List.<TaskNoteDto>of();
        var assignedTo = t.getAssignedTo();
        return TaskDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .status(t.getStatus())
                .priority(t.getPriority())
                .assignedTo(assignedTo != null ? assignedTo.getId() : null)
                .assignedToDetail(assignedTo != null ? toMinimal(assignedTo) : null)
                .createdBy(t.getCreatedBy() != null ? t.getCreatedBy().getId() : null)
                .createdByDetail(t.getCreatedBy() != null ? toMinimal(t.getCreatedBy()) : null)
                .deadline(t.getDeadline())
                .progress(t.getProgress())
                .notes(notes)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .completedAt(t.getCompletedAt())
                .isOverdue(t.getIsOverdue())
                .build();
    }

    private WorkActivityDto toActivityDto(WorkActivity a) {
        var u = a.getUser();
        return WorkActivityDto.builder()
                .id(a.getId())
                .user(u != null ? u.getId() : null)
                .userName(u != null ? userName(u) : null)
                .activityType(a.getActivityType())
                .content(a.getContent())
                .date(a.getDate())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
