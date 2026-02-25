package com.crm.controller;

import com.crm.domain.User;
import com.crm.dto.*;
import com.crm.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TasksController {

    private final TaskService taskService;

    @GetMapping("/tasks")
    public List<TaskDto> listTasks(@AuthenticationPrincipal User current) {
        return taskService.listTasks(current);
    }

    @GetMapping("/tasks/{id}")
    public TaskDto getTask(@PathVariable Long id, @AuthenticationPrincipal User current) {
        return taskService.getTask(id, current);
    }

    @PostMapping("/tasks")
    public ResponseEntity<TaskDto> createTask(@RequestBody TaskCreateDto dto, @AuthenticationPrincipal User current) {
        TaskDto created = taskService.createTask(dto, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/tasks/{id}")
    public TaskDto updateTask(@PathVariable Long id, @RequestBody TaskUpdateDto dto, @AuthenticationPrincipal User current) {
        return taskService.updateTask(id, dto, current);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, @AuthenticationPrincipal User current) {
        taskService.deleteTask(id, current);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/tasks/{id}/add_note")
    public ResponseEntity<TaskNoteDto> addNote(@PathVariable Long id, @RequestBody Map<String, String> body, @AuthenticationPrincipal User current) {
        String content = body.get("content");
        TaskNoteDto note = taskService.addNote(id, content, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(note);
    }

    @GetMapping("/activities")
    public List<WorkActivityDto> listActivities(@RequestParam(required = false) Long user, @AuthenticationPrincipal User current) {
        return taskService.listActivities(current, user);
    }

    @PostMapping("/activities")
    public ResponseEntity<WorkActivityDto> createActivity(@RequestBody WorkActivityDto dto, @AuthenticationPrincipal User current) {
        WorkActivityDto created = taskService.createActivity(dto, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
