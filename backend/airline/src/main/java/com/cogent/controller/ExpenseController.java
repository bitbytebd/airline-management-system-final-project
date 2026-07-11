package com.cogent.controller;

import com.cogent.model.Expense;
import com.cogent.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin("http://localhost:4200")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    //1. collect all data from all category
    @GetMapping
    public List<Expense> getAll(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
          
            return expenseService.findByCategory(category);
        }
        return expenseService.getAllExpenses();
    }

    // 2. collect data with fixed id
    @GetMapping("/{id}")
    public ResponseEntity<Expense> getById(@PathVariable Long id) {
        Expense expense = expenseService.getExpenseById(id);
        return expense != null ? ResponseEntity.ok(expense) : ResponseEntity.notFound().build();
    }

    //3. add new expense
    @PostMapping
    public Expense create(@RequestBody Expense expense) {
        return expenseService.saveExpense(expense);
    }

    // 4. update expense
    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(@PathVariable Long id, @RequestBody Expense expense) {
        Expense updated = expenseService.updateExpense(id, expense);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    // 5. delete expense
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok().build();
    }

    // 6. total expense for dashboard
    @GetMapping("/total")
    public Double getTotal() {
        return expenseService.getTotal();
    }
}