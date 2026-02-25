package com.crm.config;

import com.crm.domain.User;
import com.crm.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.core.Ordered;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Creates the first superadmin only from environment variables.
 * Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD (min 8 chars) when starting the app.
 * Runs only if no user with role "superadmin" exists. Superadmin cannot be created from UI or API.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class SuperadminSeeder {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment env;

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public ApplicationRunner seedSuperadminIfNeeded() {
        return args -> {
            if (userRepository.existsByRoleIgnoreCase("superadmin")) {
                log.info("Superadmin already exists; skipping seed.");
                return;
            }
            String email = env.getProperty("SUPERADMIN_EMAIL");
            String password = env.getProperty("SUPERADMIN_PASSWORD");
            if (email == null || email.isBlank() || password == null || password.length() < 8) {
                log.warn("Superadmin seed skipped: set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD (min 8 chars) to create the first superadmin.");
                return;
            }
            if (userRepository.existsByEmail(email.trim())) {
                log.info("Superadmin seed skipped: a user with email {} already exists.", email.trim());
                return;
            }
            String username = email.split("@")[0];
            int suffix = 1;
            while (userRepository.existsByUsername(username)) {
                username = email.split("@")[0] + suffix++;
            }
            User superadmin = User.builder()
                    .username(username)
                    .email(email.trim())
                    .password(passwordEncoder.encode(password))
                    .firstName("Atul")
                    .lastName("Panday")
                    .role("superadmin")
                    .active(true)
                    .build();
            userRepository.save(superadmin);
            log.info("Superadmin created for email: {}. You can log in with this email and your SUPERADMIN_PASSWORD.", email.trim());
        };
    }
}
