package com.crm.repository;

import com.crm.domain.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    @Query("SELECT DISTINCT m FROM Meeting m LEFT JOIN m.participants p WHERE m.createdBy.id = :userId OR p.user.id = :userId ORDER BY m.scheduledAt DESC")
    List<Meeting> findMeetingsForUser(@Param("userId") Long userId);
    List<Meeting> findAllByOrderByScheduledAtDesc();
}
