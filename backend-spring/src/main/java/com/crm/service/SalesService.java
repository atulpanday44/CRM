package com.crm.service;

import com.crm.domain.*;
import com.crm.dto.*;
import com.crm.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesService {

    private final ClientRepository clientRepository;
    private final ServiceRepository serviceRepository;
    private final FollowUpRepository followUpRepository;
    private final SalesActivityRepository salesActivityRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    private UserDto toUserDto(User u) {
        if (u == null) return null;
        return userService.getById(u.getId(), u);
    }

    // ---------- Clients ----------
    @Transactional(readOnly = true)
    public List<ClientDto> listClients(User current, String status, String search) {
        List<Client> list = current.isAdminOrHr()
                ? clientRepository.findAllByOrderByCreatedAtDesc()
                : clientRepository.findByAssignedToOrderByCreatedAtDesc(current);
        if (status != null) list = list.stream().filter(c -> status.equals(c.getStatus())).collect(Collectors.toList());
        if (search != null && !search.isBlank()) {
            String s = search.toLowerCase();
            list = list.stream().filter(c ->
                    (c.getClientName() != null && c.getClientName().toLowerCase().contains(s)) ||
                            (c.getCompanyName() != null && c.getCompanyName().toLowerCase().contains(s)) ||
                            (c.getEmail() != null && c.getEmail().toLowerCase().contains(s))).collect(Collectors.toList());
        }
        return list.stream().map(this::toClientDto).collect(Collectors.toList());
    }

    public ClientDto getClient(Long id, User current) {
        Client c = clientRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found."));
        if (!current.isAdminOrHr() && (c.getAssignedTo() == null || !c.getAssignedTo().getId().equals(current.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to view this client.");
        }
        return toClientDto(c);
    }

    @Transactional
    public ClientDto createClient(ClientDto dto, User current) {
        Client c = new Client();
        c.setClientName(dto.getClientName());
        c.setCompanyName(dto.getCompanyName());
        c.setEmail(dto.getEmail());
        c.setContactNo(dto.getContactNo());
        c.setAddress(dto.getAddress());
        c.setCountry(dto.getCountry());
        c.setStatus(dto.getStatus() != null ? dto.getStatus() : "Prospect");
        c.setDealValue(dto.getDealValue() != null ? dto.getDealValue() : BigDecimal.ZERO);
        c.setEntryDate(dto.getEntryDate() != null ? dto.getEntryDate() : LocalDate.now());
        c.setClosedDate(dto.getClosedDate());
        c.setNextFollowUp(dto.getNextFollowUp());
        c.setAssignedTo(dto.getAssignedTo() != null ? userRepository.findById(dto.getAssignedTo()).orElse(null) : null);
        c.setComments(dto.getComments());
        c.setTeamId(dto.getTeamId());
        Client saved = clientRepository.save(c);
        if (dto.getServiceIds() != null) {
            final Client clientRef = saved;
            for (Long sid : dto.getServiceIds()) {
                serviceRepository.findById(sid).ifPresent(svc -> {
                    ClientService cs = ClientService.builder().client(clientRef).service(svc).build();
                    clientRef.getServices().add(cs);
                });
            }
            saved = clientRepository.save(saved);
        }
        return toClientDto(saved);
    }

    @Transactional
    public ClientDto updateClient(Long id, ClientDto dto, User current) {
        Client c = clientRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found."));
        if (!current.isAdminOrHr() && (c.getAssignedTo() == null || !c.getAssignedTo().getId().equals(current.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to update this client.");
        }
        if (dto.getClientName() != null) c.setClientName(dto.getClientName());
        if (dto.getCompanyName() != null) c.setCompanyName(dto.getCompanyName());
        if (dto.getEmail() != null) c.setEmail(dto.getEmail());
        if (dto.getContactNo() != null) c.setContactNo(dto.getContactNo());
        if (dto.getAddress() != null) c.setAddress(dto.getAddress());
        if (dto.getCountry() != null) c.setCountry(dto.getCountry());
        if (dto.getStatus() != null) c.setStatus(dto.getStatus());
        if (dto.getDealValue() != null) c.setDealValue(dto.getDealValue());
        if (dto.getEntryDate() != null) c.setEntryDate(dto.getEntryDate());
        if (dto.getClosedDate() != null) c.setClosedDate(dto.getClosedDate());
        if (dto.getNextFollowUp() != null) c.setNextFollowUp(dto.getNextFollowUp());
        if (dto.getAssignedTo() != null && current.isAdminOrHr()) c.setAssignedTo(userRepository.findById(dto.getAssignedTo()).orElse(c.getAssignedTo()));
        if (dto.getComments() != null) c.setComments(dto.getComments());
        if (dto.getTeamId() != null) c.setTeamId(dto.getTeamId());
        if (dto.getServiceIds() != null) {
            c.getServices().clear();
            final Client clientRef = c;
            for (Long sid : dto.getServiceIds()) {
                serviceRepository.findById(sid).ifPresent(svc -> clientRef.getServices().add(ClientService.builder().client(clientRef).service(svc).build()));
            }
        }
        c = clientRepository.save(c);
        return toClientDto(c);
    }

    @Transactional
    public ClientDto updateClientStatus(Long id, String status, BigDecimal dealValue, User current) {
        Client c = clientRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found."));
        if (!List.of("Prospect", "Negotiation", "Closed", "Lost").contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status.");
        }
        c.setStatus(status);
        if ("Closed".equals(status)) {
            c.setClosedDate(LocalDate.now());
            if (dealValue != null) c.setDealValue(dealValue);
            else if (c.getDealValue() == null || c.getDealValue().compareTo(BigDecimal.ZERO) == 0) c.setDealValue(new BigDecimal("5000"));
        }
        c = clientRepository.save(c);
        return toClientDto(c);
    }

    public Map<String, Object> analytics(User current) {
        List<Client> list = current.isAdminOrHr() ? clientRepository.findAllByOrderByCreatedAtDesc() : clientRepository.findByAssignedToOrderByCreatedAtDesc(current);
        BigDecimal totalRevenue = list.stream().filter(c -> "Closed".equals(c.getStatus())).map(Client::getDealValue).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalLeads = list.size();
        long prospect = list.stream().filter(c -> "Prospect".equals(c.getStatus())).count();
        long negotiation = list.stream().filter(c -> "Negotiation".equals(c.getStatus())).count();
        long closed = list.stream().filter(c -> "Closed".equals(c.getStatus())).count();
        long lost = list.stream().filter(c -> "Lost".equals(c.getStatus())).count();
        double conversionRate = totalLeads > 0 ? (closed * 100.0 / totalLeads) : 0;
        double avgDays = list.stream().filter(c -> "Closed".equals(c.getStatus()) && c.getClosedDate() != null && c.getEntryDate() != null)
                .mapToLong(c -> java.time.temporal.ChronoUnit.DAYS.between(c.getEntryDate(), c.getClosedDate())).average().orElse(0);
        Map<String, Object> result = new HashMap<>();
        result.put("total_revenue", totalRevenue != null ? totalRevenue.doubleValue() : 0);
        result.put("conversion_funnel", Map.of("total_leads", totalLeads, "prospect", prospect, "negotiation", negotiation, "closed", closed, "lost", lost));
        result.put("conversion_rate", Math.round(conversionRate * 100) / 100.0);
        result.put("average_time_to_close", Math.round(avgDays));
        return result;
    }

    @Transactional
    public void deleteClient(Long id, User current) {
        Client c = clientRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Client not found."));
        if (!current.isAdminOrHr() && (c.getAssignedTo() == null || !c.getAssignedTo().getId().equals(current.getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to delete this client.");
        }
        clientRepository.delete(c);
    }

    private ClientDto toClientDto(Client c) {
        List<ClientServiceDto> svcList = c.getServices().stream().map(cs -> ClientServiceDto.builder()
                .id(cs.getId())
                .service(ServiceDto.builder().id(cs.getService().getId()).name(cs.getService().getName()).description(cs.getService().getDescription()).build())
                .createdAt(cs.getCreatedAt())
                .build()).collect(Collectors.toList());
        List<Long> serviceIds = c.getServices().stream().map(cs -> cs.getService().getId()).collect(Collectors.toList());
        return ClientDto.builder()
                .id(c.getId())
                .clientName(c.getClientName())
                .companyName(c.getCompanyName())
                .email(c.getEmail())
                .contactNo(c.getContactNo())
                .address(c.getAddress())
                .country(c.getCountry())
                .status(c.getStatus())
                .dealValue(c.getDealValue())
                .entryDate(c.getEntryDate())
                .closedDate(c.getClosedDate())
                .nextFollowUp(c.getNextFollowUp())
                .assignedTo(c.getAssignedTo() != null ? c.getAssignedTo().getId() : null)
                .assignedToDetail(toUserDto(c.getAssignedTo()))
                .comments(c.getComments())
                .teamId(c.getTeamId())
                .services(svcList)
                .serviceIds(serviceIds)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    // ---------- Services (read-only) ----------
    @Transactional(readOnly = true)
    public List<ServiceDto> listServices() {
        return serviceRepository.findAll().stream().map(s -> ServiceDto.builder().id(s.getId()).name(s.getName()).description(s.getDescription()).build()).collect(Collectors.toList());
    }

    // ---------- Follow-ups ----------
    @Transactional(readOnly = true)
    public List<FollowUpDto> listFollowUps(User current, Long clientId, Boolean done) {
        List<FollowUp> list = followUpRepository.findAll().stream()
                .filter(f -> current.isAdminOrHr() || (f.getCreatedBy() != null && f.getCreatedBy().getId().equals(current.getId())) || (f.getClient().getAssignedTo() != null && f.getClient().getAssignedTo().getId().equals(current.getId())))
                .collect(Collectors.toList());
        if (clientId != null) list = list.stream().filter(f -> f.getClient().getId().equals(clientId)).collect(Collectors.toList());
        if (done != null) list = list.stream().filter(f -> done.equals(f.getDone())).collect(Collectors.toList());
        list.sort(Comparator.comparing(FollowUp::getDate).thenComparing(FollowUp::getCreatedAt, Comparator.reverseOrder()));
        return list.stream().map(this::toFollowUpDto).collect(Collectors.toList());
    }

    @Transactional
    public FollowUpDto createFollowUp(FollowUpDto dto, User current) {
        Client client = clientRepository.findById(dto.getClient()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Client not found."));
        FollowUp f = FollowUp.builder().client(client).date(dto.getDate()).notes(dto.getNotes()).done(dto.getDone() != null && dto.getDone()).createdBy(current).build();
        f = followUpRepository.save(f);
        return toFollowUpDto(f);
    }

    @Transactional
    public FollowUpDto toggleFollowUpDone(Long id, User current) {
        FollowUp f = followUpRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Follow-up not found."));
        f.setDone(!Boolean.TRUE.equals(f.getDone()));
        f = followUpRepository.save(f);
        return toFollowUpDto(f);
    }

    private FollowUpDto toFollowUpDto(FollowUp f) {
        return FollowUpDto.builder()
                .id(f.getId())
                .client(f.getClient().getId())
                .clientName(f.getClient().getClientName())
                .date(f.getDate())
                .notes(f.getNotes())
                .done(f.getDone())
                .createdBy(f.getCreatedBy() != null ? f.getCreatedBy().getId() : null)
                .createdByDetail(toUserDto(f.getCreatedBy()))
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }

    // ---------- Sales activities ----------
    @Transactional(readOnly = true)
    public List<SalesActivityDto> listSalesActivities(User current, Long clientId, String activityType) {
        List<SalesActivity> list = current.isAdminOrHr() ? salesActivityRepository.findAll().stream().sorted(Comparator.comparing(SalesActivity::getDate).reversed().thenComparing(SalesActivity::getCreatedAt).reversed()).collect(Collectors.toList())
                : salesActivityRepository.findByUserIdOrderByDateDescCreatedAtDesc(current.getId());
        if (!current.isAdminOrHr() && list.isEmpty()) return List.of();
        if (clientId != null) list = list.stream().filter(a -> a.getClient() != null && a.getClient().getId().equals(clientId)).collect(Collectors.toList());
        if (activityType != null) list = list.stream().filter(a -> activityType.equals(a.getActivityType())).collect(Collectors.toList());
        return list.stream().map(this::toSalesActivityDto).collect(Collectors.toList());
    }

    @Transactional
    public SalesActivityDto createSalesActivity(SalesActivityDto dto, User current) {
        Client client = dto.getClient() != null ? clientRepository.findById(dto.getClient()).orElse(null) : null;
        SalesActivity a = SalesActivity.builder()
                .user(current)
                .client(client)
                .activityType(dto.getActivityType() != null ? dto.getActivityType() : "Lead")
                .date(dto.getDate())
                .notes(dto.getNotes())
                .amount(dto.getValue() != null ? dto.getValue() : BigDecimal.ZERO)
                .build();
        a = salesActivityRepository.save(a);
        return toSalesActivityDto(a);
    }

    private SalesActivityDto toSalesActivityDto(SalesActivity a) {
        return SalesActivityDto.builder()
                .id(a.getId())
                .user(a.getUser().getId())
                .userDetail(toUserDto(a.getUser()))
                .client(a.getClient() != null ? a.getClient().getId() : null)
                .clientName(a.getClient() != null ? a.getClient().getClientName() : null)
                .activityType(a.getActivityType())
                .date(a.getDate())
                .notes(a.getNotes())
                .value(a.getAmount())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
