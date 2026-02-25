package com.crm.service;

import com.crm.domain.User;
import com.crm.dto.*;
import com.crm.repository.UserRepository;
import com.crm.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password.");
        }
        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account is disabled.");
        }
        String access = jwtService.buildAccessToken(user);
        String refresh = jwtService.buildRefreshToken(user);
        return AuthResponse.builder()
                .access(access)
                .refresh(refresh)
                .user(toDto(user))
                .build();
    }

    @Transactional
    public AuthResponse register(UserCreateDto dto) {
        if (!dto.getPassword().equals(dto.getPassword2())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password fields didn't match.");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A user with this email already exists.");
        }
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A user with this username already exists.");
        }
        User user = toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole("user");
        user = userRepository.save(user);
        String access = jwtService.buildAccessToken(user);
        String refresh = jwtService.buildRefreshToken(user);
        return AuthResponse.builder()
                .access(access)
                .refresh(refresh)
                .user(toDto(user))
                .build();
    }

    private static final List<String> ALLOWED_ROLES = List.of("user", "hr", "admin", "finance", "tech_support");

    private static boolean isAllowedRole(String role) {
        return role != null && ALLOWED_ROLES.contains(role.toLowerCase());
    }

    public UserDto getCurrentUser(User current) {
        return toDto(current);
    }

    public List<UserDto> listUsers(User current) {
        if (current.isAdminOrHr()) {
            return userRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
        }
        return List.of(toDto(current));
    }

    public UserDto getById(Long id, User current) {
        if (!current.isAdminOrHr() && !current.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to view this user.");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        return toDto(user);
    }

    @Transactional
    public UserDto createUser(UserCreateDto dto, User current) {
        if (!current.isAdminOrHr()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to create users.");
        }
        if (!dto.getPassword().equals(dto.getPassword2())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password fields didn't match.");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A user with this email already exists.");
        }
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A user with this username already exists.");
        }
        User user = toEntity(dto);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        String role = dto.getRole() != null && isAllowedRole(dto.getRole()) ? dto.getRole().toLowerCase() : "user";
        user.setRole(role);
        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public UserDto updateUser(Long id, UserUpdateDto dto, User current) {
        if (!current.isAdminOrHr() && !current.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to update this user.");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        if (dto.getUsername() != null) user.setUsername(dto.getUsername());
        if (dto.getEmail() != null) {
            if (!dto.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(dto.getEmail())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A user with this email already exists.");
            }
            user.setEmail(dto.getEmail());
        }
        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getRole() != null && current.isAdminOrHr() && isAllowedRole(dto.getRole())
                && !"superadmin".equalsIgnoreCase(user.getRole())) {
            user.setRole(dto.getRole().toLowerCase());
        }
        if (dto.getDepartment() != null) user.setDepartment(dto.getDepartment());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getAddress() != null) user.setAddress(dto.getAddress());
        if (dto.getDob() != null) user.setDob(dto.getDob());
        if (dto.getDoj() != null) user.setDoj(dto.getDoj());
        if (dto.getAge() != null) user.setAge(dto.getAge());
        if (dto.getActive() != null && current.isAdminOrHr()) user.setActive(dto.getActive());
        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public void deleteUser(Long id, User current) {
        if (!current.isAdminOrHr()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to delete users.");
        }
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found."));
        if ("superadmin".equalsIgnoreCase(target.getRole())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Superadmin cannot be deleted.");
        }
        userRepository.deleteById(id);
    }

    private UserDto toDto(User u) {
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

    private User toEntity(UserCreateDto dto) {
        return User.builder()
                .username(dto.getUsername())
                .email(dto.getEmail())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .role(dto.getRole() != null ? dto.getRole() : "user")
                .department(dto.getDepartment())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .dob(dto.getDob())
                .doj(dto.getDoj())
                .age(dto.getAge())
                .active(true)
                .build();
    }
}
