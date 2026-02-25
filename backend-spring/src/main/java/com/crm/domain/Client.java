package com.crm.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_name", nullable = false)
    private String clientName;
    @Column(name = "company_name")
    private String companyName;
    @Column(nullable = false)
    private String email;
    @Column(name = "contact_no", length = 20)
    private String contactNo;
    @Column(columnDefinition = "TEXT")
    private String address;
    @Column(length = 100)
    private String country;

    @Column(length = 20)
    @Builder.Default
    private String status = "Prospect"; // Prospect, Negotiation, Closed, Lost
    @Column(name = "deal_value", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal dealValue = BigDecimal.ZERO;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;
    @Column(name = "closed_date")
    private LocalDate closedDate;
    @Column(name = "next_follow_up")
    private LocalDate nextFollowUp;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @Column(columnDefinition = "TEXT")
    private String comments;
    @Column(name = "team_id", length = 100)
    private String teamId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ClientService> services = new ArrayList<>();
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FollowUp> followUps = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
