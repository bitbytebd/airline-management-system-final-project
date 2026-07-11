package com.cogent.controller;

import com.cogent.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin("http://localhost:4200")
public class ReportController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping("/financial-overview")
    public Map<String, Object> getFinancialOverview(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "paymentMethod", required = false) String paymentMethod,
            @RequestParam(value = "period", required = false) String period) {
        LocalDate start = startDate != null && !startDate.isBlank() ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null && !endDate.isBlank() ? LocalDate.parse(endDate) : null;
        String method = paymentMethod != null && !"ALL".equalsIgnoreCase(paymentMethod) ? paymentMethod : null;
        return paymentService.getFinancialReport(start, end, method, period);
    }
}
