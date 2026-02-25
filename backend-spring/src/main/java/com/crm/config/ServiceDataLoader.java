package com.crm.config;

import com.crm.domain.Service;
import com.crm.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class ServiceDataLoader {

    private static final List<String> SERVICE_NAMES = List.of(
            "Bulk SMS", "OTP SMS", "Voice SMS", "Cloud Telephony",
            "WhatsApp Marketing", "API & SMPP Integration"
    );

    @Bean
    public ApplicationRunner initServices(ServiceRepository serviceRepository) {
        return args -> {
            if (serviceRepository.count() == 0) {
                for (String name : SERVICE_NAMES) {
                    serviceRepository.save(Service.builder().name(name).build());
                }
            }
        };
    }
}
