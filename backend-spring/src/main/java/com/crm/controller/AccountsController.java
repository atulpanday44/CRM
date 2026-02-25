package com.crm.controller;

import com.crm.domain.User;
import com.crm.dto.*;
import com.crm.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/accounts/users")
@RequiredArgsConstructor
public class AccountsController {

    private final UserService userService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserCreateDto dto) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("detail", "Self-registration is disabled. Contact your administrator or HR for an account."));
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal User current) {
        return userService.getCurrentUser(current);
    }

    @GetMapping
    public List<UserDto> list(@AuthenticationPrincipal User current) {
        return userService.listUsers(current);
    }

    @GetMapping("/{id}")
    public UserDto getById(@PathVariable Long id, @AuthenticationPrincipal User current) {
        return userService.getById(id, current);
    }

    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody UserCreateDto dto, @AuthenticationPrincipal User current) {
        UserDto created = userService.createUser(dto, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/{id}")
    public UserDto update(@PathVariable Long id, @RequestBody UserUpdateDto dto, @AuthenticationPrincipal User current) {
        return userService.updateUser(id, dto, current);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id, @AuthenticationPrincipal User current) {
        userService.deleteUser(id, current);
        return ResponseEntity.noContent().build();
    }
}
