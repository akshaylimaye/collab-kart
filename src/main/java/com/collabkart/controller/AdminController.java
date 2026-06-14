package com.collabkart.controller;

import com.collabkart.dto.CampaignResponse;
import com.collabkart.dto.UserResponse;
import com.collabkart.service.AdminService;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public List<UserResponse> getUsers() {
        return adminService.getUsers();
    }

    @GetMapping("/campaigns")
    public List<CampaignResponse> getCampaigns() {
        return adminService.getCampaigns();
    }

    @PatchMapping("/campaigns/{id}/approve")
    public CampaignResponse approveCampaign(@PathVariable UUID id) {
        return adminService.approveCampaign(id);
    }

    @PatchMapping("/campaigns/{id}/reject")
    public CampaignResponse rejectCampaign(@PathVariable UUID id) {
        return adminService.rejectCampaign(id);
    }
}
