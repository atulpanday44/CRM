package com.crm.repository;

import com.crm.domain.WorkActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkActivityRepository extends JpaRepository<WorkActivity, Long> {
    List<WorkActivity> findByUserIdOrderByDateDescCreatedAtDesc(Long userId);
    List<WorkActivity> findAllByOrderByDateDescCreatedAtDesc();
}
