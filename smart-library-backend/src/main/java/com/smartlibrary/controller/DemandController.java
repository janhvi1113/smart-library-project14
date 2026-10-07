package com.smartlibrary.controller;

import com.smartlibrary.dto.DemandResult;
import com.smartlibrary.service.DemandService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/demand")
public class DemandController {

    private final DemandService demandService;

    public DemandController(DemandService demandService) {
        this.demandService = demandService;
    }

    @GetMapping("/dashboard")
    public List<DemandResult> getDemandDashboard() {
        return demandService.getDemandDashboard();
    }
}