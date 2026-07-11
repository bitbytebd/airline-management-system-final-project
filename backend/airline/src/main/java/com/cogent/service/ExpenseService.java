package com.cogent.service;

import com.cogent.dao.ExpenseDAO;
import com.cogent.model.Expense;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service(value = "expenseService")
@Transactional
public class ExpenseService {

    @Autowired
    private ExpenseDAO expensesDAO;

    public List<Expense> getAllExpenses() {
    	return expensesDAO.getAll(); }

    public Expense getExpenseById(Long id) {
    	return expensesDAO.getById(id); }
    
    //need these 3 for dashboard
    public Double getTotal() {
        return expensesDAO.getTotalExpense();
    }


    public List<Double> getExpensesByPeriod(String period) {
        return expensesDAO.getExpensesByPeriod(period);
    }
    

    public List<Expense> findByCategory(String category) {
        return expensesDAO.findByCategory(category);
    }
    
    
    public List<Object[]> getByCategory() {
        return expensesDAO.getByCategory();
    }
    
    
    public List<Object[]> getCategoryWiseExpense() {
    	         return expensesDAO.getCategoryWiseExpense(); }

    @Transactional
    public Expense saveExpense(Expense expense) {
        if (expense.getStatus() == null) expense.setStatus("PENDING_PAYMENT");
        return expensesDAO.save(expense);
    }

    @Transactional
    public Expense markExpensePaid(Long id, String paymentMethod, String referenceNo) {
        Expense existing = expensesDAO.getById(id);
        if (existing == null) return null;
        existing.setStatus("PAID");
        if (paymentMethod != null) existing.setPaymentMethod(paymentMethod);
        if (referenceNo != null) existing.setReferenceNo(referenceNo);
        return expensesDAO.update(existing);
    }

    @Transactional
    public Expense updateExpense(Long id, Expense details) {
        Expense existing = expensesDAO.getById(id);
        if (existing != null) {
            existing.setCategory(details.getCategory());
            
            existing.setAmount(details.getAmount());
            
            existing.setExpenseDate(details.getExpenseDate());
            
            existing.setDescription(details.getDescription());
            
            existing.setVendorName(details.getVendorName());
            
            existing.setPaymentMethod(details.getPaymentMethod());
            
            existing.setReferenceNo(details.getReferenceNo());
            
            existing.setDepartment(details.getDepartment());
            
            existing.setStatus(details.getStatus());
            
            existing.setBookingReference(details.getBookingReference());
            
            return expensesDAO.update(existing);
        }
        return null;
    }

    @Transactional
    public void deleteExpense(Long id) {
    	expensesDAO.delete(id); }

    @Transactional
    public Double getTotalExpense() {
    	return expensesDAO.getTotalExpense(); }
}
