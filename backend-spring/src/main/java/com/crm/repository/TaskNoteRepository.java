package com.crm.repository;

import com.crm.domain.TaskNote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskNoteRepository extends JpaRepository<TaskNote, Long> {
}
