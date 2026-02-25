package com.crm.repository;

import com.crm.domain.Client;
import com.crm.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByAssignedToOrderByCreatedAtDesc(User assignedTo);
    List<Client> findAllByOrderByCreatedAtDesc();
}
