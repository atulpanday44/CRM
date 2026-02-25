package com.crm.controller;

import com.crm.domain.User;
import com.crm.dto.*;
import com.crm.service.SalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    @GetMapping("/clients")
    public List<ClientDto> listClients(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal User current
    ) {
        return salesService.listClients(current, status, search);
    }

    @GetMapping("/clients/analytics")
    public Map<String, Object> analytics(@AuthenticationPrincipal User current) {
        return salesService.analytics(current);
    }

    @GetMapping("/clients/{id}")
    public ClientDto getClient(@PathVariable Long id, @AuthenticationPrincipal User current) {
        return salesService.getClient(id, current);
    }

    @PostMapping("/clients")
    public ResponseEntity<ClientDto> createClient(@RequestBody ClientDto dto, @AuthenticationPrincipal User current) {
        ClientDto created = salesService.createClient(dto, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/clients/{id}")
    public ClientDto updateClient(@PathVariable Long id, @RequestBody ClientDto dto, @AuthenticationPrincipal User current) {
        return salesService.updateClient(id, dto, current);
    }

    @DeleteMapping("/clients/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable Long id, @AuthenticationPrincipal User current) {
        salesService.deleteClient(id, current);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/clients/{id}/update_status")
    public ClientDto updateClientStatus(@PathVariable Long id, @RequestBody Map<String, Object> body, @AuthenticationPrincipal User current) {
        String status = (String) body.get("status");
        BigDecimal dealValue = body.get("deal_value") != null ? new BigDecimal(body.get("deal_value").toString()) : null;
        return salesService.updateClientStatus(id, status, dealValue, current);
    }

    @GetMapping("/services")
    public List<ServiceDto> listServices(@AuthenticationPrincipal User current) {
        return salesService.listServices();
    }

    @GetMapping("/follow-ups")
    public List<FollowUpDto> listFollowUps(
            @RequestParam(required = false) Long client,
            @RequestParam(required = false) Boolean done,
            @AuthenticationPrincipal User current
    ) {
        return salesService.listFollowUps(current, client, done);
    }

    @PostMapping("/follow-ups")
    public ResponseEntity<FollowUpDto> createFollowUp(@RequestBody FollowUpDto dto, @AuthenticationPrincipal User current) {
        FollowUpDto created = salesService.createFollowUp(dto, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/follow-ups/{id}/toggle_done")
    public FollowUpDto toggleFollowUpDone(@PathVariable Long id, @AuthenticationPrincipal User current) {
        return salesService.toggleFollowUpDone(id, current);
    }

    @GetMapping("/activities")
    public List<SalesActivityDto> listActivities(
            @RequestParam(required = false) Long client,
            @RequestParam(required = false) String activity_type,
            @AuthenticationPrincipal User current
    ) {
        return salesService.listSalesActivities(current, client, activity_type);
    }

    @PostMapping("/activities")
    public ResponseEntity<SalesActivityDto> createActivity(@RequestBody SalesActivityDto dto, @AuthenticationPrincipal User current) {
        SalesActivityDto created = salesService.createSalesActivity(dto, current);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
