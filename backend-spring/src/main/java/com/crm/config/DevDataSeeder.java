package com.crm.config;

import com.crm.domain.*;
import com.crm.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Seeds sample data (tasks, meetings, activities, leave requests, clients).
 * Runs when profile "dev" or "pg" is active and DB has no tasks yet.
 */
@Configuration
@Profile({"dev", "pg"})
@RequiredArgsConstructor
@Slf4j
public class DevDataSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TaskRepository taskRepository;
    private final MeetingRepository meetingRepository;
    private final WorkActivityRepository workActivityRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final ClientRepository clientRepository;
    private final FollowUpRepository followUpRepository;

    @Bean
    @Order(org.springframework.core.Ordered.LOWEST_PRECEDENCE)
    public ApplicationRunner seedDevData() {
        return args -> {
            if (taskRepository.count() > 0) {
                log.info("Dev data already present; skipping seed.");
                return;
            }
            Optional<User> superadminOpt = userRepository.findAll().stream()
                    .filter(u -> "superadmin".equalsIgnoreCase(u.getRole()))
                    .findFirst();
            if (superadminOpt.isEmpty()) {
                log.warn("Dev data seed skipped: no superadmin found. Start with SUPERADMIN_EMAIL/SUPERADMIN_PASSWORD first.");
                return;
            }
            User superadmin = superadminOpt.get();

            // Ensure we have HR and employee with real names
            User hr = getOrCreateUser("gurpreet.kaur@example.com", "gurpreet.kaur", "Gurpreet", "Kaur", "hr");
            User emp = getOrCreateUser("rahul.sharma@example.com", "rahul.sharma", "Rahul", "Sharma", "user");

            // Tasks
            Task t1 = Task.builder()
                    .title("Review Q3 reports")
                    .description("Complete and share with team")
                    .status("pending")
                    .priority("high")
                    .assignedTo(superadmin)
                    .createdBy(superadmin)
                    .deadline(LocalDate.now().plusDays(5))
                    .progress(0)
                    .build();
            Task t2 = Task.builder()
                    .title("Onboard new hire")
                    .description("Setup accounts and access")
                    .status("in_progress")
                    .priority("medium")
                    .assignedTo(hr)
                    .createdBy(superadmin)
                    .deadline(LocalDate.now().plusDays(3))
                    .progress(40)
                    .build();
            Task t3 = Task.builder()
                    .title("Complete training module")
                    .description("Finish mandatory training")
                    .status("pending")
                    .priority("medium")
                    .assignedTo(emp)
                    .createdBy(hr)
                    .deadline(LocalDate.now().minusDays(1))
                    .progress(0)
                    .build();
            taskRepository.saveAll(List.of(t1, t2, t3));

            // Meetings
            Meeting m1 = Meeting.builder()
                    .title("Weekly sync")
                    .description("Team standup")
                    .scheduledAt(LocalDateTime.now().plusDays(1).withHour(10).withMinute(0))
                    .location("Room A")
                    .status("scheduled")
                    .createdBy(superadmin)
                    .notes("Agenda: updates")
                    .build();
            m1 = meetingRepository.save(m1);
            MeetingParticipant mp1 = MeetingParticipant.builder().meeting(m1).user(superadmin).build();
            MeetingParticipant mp2 = MeetingParticipant.builder().meeting(m1).user(hr).build();
            m1.getParticipants().add(mp1);
            m1.getParticipants().add(mp2);
            meetingRepository.save(m1);

            Meeting m2 = Meeting.builder()
                    .title("Client call - Acme")
                    .scheduledAt(LocalDateTime.now().plusDays(2).withHour(14).withMinute(30))
                    .location("Zoom")
                    .status("scheduled")
                    .createdBy(superadmin)
                    .build();
            meetingRepository.save(m2);

            // Work activities (realistic entries – Superadmin/HR can see on Dashboard)
            WorkActivity wa1 = WorkActivity.builder()
                    .user(superadmin)
                    .activityType("daily")
                    .content("Reviewed dashboard and approved leave requests.")
                    .date(LocalDate.now())
                    .build();
            WorkActivity wa2 = WorkActivity.builder()
                    .user(hr)
                    .activityType("daily")
                    .content("Conducted orientation for new joiners. Updated leave policy doc.")
                    .date(LocalDate.now())
                    .build();
            WorkActivity wa3 = WorkActivity.builder()
                    .user(emp)
                    .activityType("daily")
                    .content("Completed training module 1.")
                    .date(LocalDate.now())
                    .build();
            workActivityRepository.saveAll(List.of(wa1, wa2, wa3));

            // Leave requests
            LeaveRequest lr1 = LeaveRequest.builder()
                    .user(hr)
                    .startDate(LocalDate.now().plusDays(10))
                    .endDate(LocalDate.now().plusDays(12))
                    .leaveType("Paid Leave")
                    .reason("Family event")
                    .status("pending")
                    .build();
            LeaveRequest lr2 = LeaveRequest.builder()
                    .user(emp)
                    .startDate(LocalDate.now().minusDays(5))
                    .endDate(LocalDate.now().minusDays(3))
                    .leaveType("Medical Leave")
                    .reason("Medical appointment")
                    .status("approved")
                    .approvedBy(superadmin)
                    .approvedAt(LocalDateTime.now().minusDays(4))
                    .build();
            LeaveRequest lr3 = LeaveRequest.builder()
                    .user(emp)
                    .startDate(LocalDate.now().plusDays(20))
                    .endDate(LocalDate.now().plusDays(22))
                    .leaveType("Vacation")
                    .reason("Vacation")
                    .status("pending")
                    .build();
            leaveRequestRepository.saveAll(List.of(lr1, lr2, lr3));

            // Clients and follow-ups (for Sales)
            if (clientRepository.count() == 0) {
                Client c1 = Client.builder()
                        .clientName("Acme Corp")
                        .companyName("Acme Corporation")
                        .email("contact@acmecorp.com")
                        .contactNo("+1-234-567-890")
                        .address("123 Main St")
                        .country("USA")
                        .status("Prospect")
                        .dealValue(BigDecimal.ZERO)
                        .entryDate(LocalDate.now().minusDays(10))
                        .nextFollowUp(LocalDate.now().plusDays(5))
                        .assignedTo(superadmin)
                        .build();
                Client c2 = Client.builder()
                        .clientName("Beta Ltd")
                        .companyName("Beta Limited")
                        .email("beta@betalimited.com")
                        .contactNo("+1-987-654-321")
                        .status("Negotiation")
                        .dealValue(BigDecimal.ZERO)
                        .entryDate(LocalDate.now().minusDays(5))
                        .nextFollowUp(LocalDate.now().plusDays(2))
                        .assignedTo(superadmin)
                        .build();
                Client c3 = Client.builder()
                        .clientName("Gamma Inc")
                        .companyName("Gamma Incorporated")
                        .email("gamma@gammainc.com")
                        .contactNo("+1-555-234-567")
                        .status("Closed")
                        .dealValue(new BigDecimal("12500"))
                        .entryDate(LocalDate.now().minusDays(20))
                        .closedDate(LocalDate.now().minusDays(2))
                        .assignedTo(superadmin)
                        .build();
                Client c4 = Client.builder()
                        .clientName("Delta Co")
                        .companyName("Delta Company")
                        .email("sales@deltaco.com")
                        .contactNo("+1-222-333-444")
                        .status("Lost")
                        .dealValue(BigDecimal.ZERO)
                        .entryDate(LocalDate.now().minusDays(15))
                        .closedDate(LocalDate.now().minusDays(5))
                        .assignedTo(superadmin)
                        .build();
                c1 = clientRepository.save(c1);
                c2 = clientRepository.save(c2);
                c3 = clientRepository.save(c3);
                c4 = clientRepository.save(c4);

                FollowUp fu1 = FollowUp.builder().client(c1).date(LocalDate.now().plusDays(5)).notes("Follow up on proposal").done(false).build();
                FollowUp fu2 = FollowUp.builder().client(c2).date(LocalDate.now().plusDays(2)).notes("Discuss contract").done(false).build();
                followUpRepository.saveAll(List.of(fu1, fu2));
            }

            log.info("Dev data seeded: tasks, meetings, activities, leave requests, clients.");
        };
    }

    private User getOrCreateUser(String email, String username, String firstName, String lastName, String role) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    if (userRepository.existsByUsername(username)) {
                        return userRepository.findByUsername(username).orElseThrow();
                    }
                    User u = User.builder()
                            .email(email)
                            .username(username)
                            .password(passwordEncoder.encode("password123"))
                            .firstName(firstName)
                            .lastName(lastName)
                            .role(role)
                            .active(true)
                            .build();
                    return userRepository.save(u);
                });
    }
}
