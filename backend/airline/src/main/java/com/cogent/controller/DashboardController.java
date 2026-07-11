package com.cogent.controller;

import com.cogent.service.BookingService;
import com.cogent.service.ExpenseService;
import com.cogent.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("http://localhost:4200")

public class DashboardController {

    @Autowired
    private BookingService bookingServices;//use all property and methods without creating BookingService class object
    
    @Autowired
    private ExpenseService expenseServices;//use all property and methods without creating ExpenseService class object

    @Autowired
    private PaymentService paymentServices;//use all property and methods without creating PaymentService class object

  //GIVES THE SUMMARY OR (TOTAL SALES AND EXPENSES) USING getSummary METHOD
    
    @GetMapping("/summary")
    public List<Double> getSummary() {
        Double salesSummary = paymentServices.getStats().getTotalRevenue();
        Double expenseSummary = expenseServices.getTotal();
        return List.of(salesSummary != null ? salesSummary : 0.0, expenseSummary != null ? expenseSummary : 0.0);
    }

 //GIVEL ALL SALES DATA CHART BY USING getSalesChart
    @GetMapping("/sales-chart")
    public List<Double> getSalesChart(@RequestParam("period") String periods) {
        return bookingServices.getSalesByPeriod(periods);
    }

    //gives all expenses data chart
    
    @GetMapping("/expense-chart")
    public List<Double> getExpenseChart(@RequestParam("period") String periods) {
        return expenseServices.getExpensesByPeriod(periods);
    }

    @GetMapping("/financial-report")
    public Map<String, Object> getFinancialReport(
            @RequestParam(value = "startDate", required = false) String startDate,
            @RequestParam(value = "endDate", required = false) String endDate,
            @RequestParam(value = "paymentMethod", required = false) String paymentMethod,
            @RequestParam(value = "period", required = false) String period) {
        LocalDate start = startDate != null && !startDate.isBlank() ? LocalDate.parse(startDate) : null;
        LocalDate end = endDate != null && !endDate.isBlank() ? LocalDate.parse(endDate) : null;
        String method = paymentMethod != null && !"ALL".equalsIgnoreCase(paymentMethod) ? paymentMethod : null;
        return paymentServices.getFinancialReport(start, end, method, period);
    }
}
