package com.crm.repository;

import com.crm.domain.FollowUp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FollowUpRepository extends JpaRepository<FollowUp, Long> {
    List<FollowUp> findByClientIdOrderByDateAscCreatedAtDesc(Long clientId);
}
