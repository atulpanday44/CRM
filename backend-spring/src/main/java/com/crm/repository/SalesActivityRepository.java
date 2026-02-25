package com.crm.repository;

import com.crm.domain.SalesActivity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalesActivityRepository extends JpaRepository<SalesActivity, Long> {
    List<SalesActivity> findByUserIdOrderByDateDescCreatedAtDesc(Long userId);
}
