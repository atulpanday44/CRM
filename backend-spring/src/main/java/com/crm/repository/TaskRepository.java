package com.crm.repository;

import com.crm.domain.Task;
import com.crm.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAssignedToOrderByCreatedAtDesc(User user);
    List<Task> findAllByOrderByCreatedAtDesc();
}
