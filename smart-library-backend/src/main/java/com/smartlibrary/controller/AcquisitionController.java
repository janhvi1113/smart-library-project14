package com.smartlibrary.controller;

import com.smartlibrary.dto.AcquisitionResult;
import com.smartlibrary.service.AcquisitionService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/acquisition")
public class AcquisitionController {

    private final AcquisitionService acquisitionService;

    public AcquisitionController(AcquisitionService acquisitionService) {
        this.acquisitionService = acquisitionService;
    }

    @GetMapping("/suggestions")
    public List<AcquisitionResult> getSuggestions() {
        return acquisitionService.getSuggestions();
    }
}