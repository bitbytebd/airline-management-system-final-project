package com.cogent.dao;

import com.cogent.model.Expense;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.persistence.TypedQuery;

import org.springframework.stereotype.Repository;
import java.util.List;

@Repository(value = "expenseDAO")
@Transactional
public class ExpenseDAO {

    @PersistenceContext
    private EntityManager entityManager;

    public List<Expense> getAll() {
        return entityManager.createQuery("FROM Expense e ORDER BY e.expenseDate DESC", Expense.class).getResultList();
    }

    public Expense getById(Long id) {
        return entityManager.find(Expense.class, id);
    }
    

    public List<Expense> findByCategory(String category) {
        String sql = "FROM Expense e WHERE e.category = :cat";
        return entityManager.createQuery(sql, Expense.class)
                            .setParameter("cat", category)
                            .getResultList();
    }
    

    public List<Double> getExpensesByPeriod(String period) {
        String dateCondition = "";
        
        // According to Period , create  SQL Condition
        switch (period) {
            case "daily":
                dateCondition = "STR_TO_DATE(expense_date, '%Y-%m-%d') = CURDATE()";
                break;
            case "weekly":
                dateCondition = "YEARWEEK(STR_TO_DATE(expense_date, '%Y-%m-%d'), 1) = YEARWEEK(CURDATE(), 1)";
                break;
            case "monthly":
                dateCondition = "MONTH(STR_TO_DATE(expense_date, '%Y-%m-%d')) = MONTH(CURDATE()) AND YEAR(STR_TO_DATE(expense_date, '%Y-%m-%d')) = YEAR(CURDATE())";
                break;
            case "6months":
            default:
                dateCondition = "STR_TO_DATE(expense_date, '%Y-%m-%d') >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
                break;
        }

        // Query Execution: expenses table and amount column
        String sql = "SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE " + dateCondition;
        return entityManager.createNativeQuery(sql).getResultList();
    }

    // categorywise (Pie Chart)
    @SuppressWarnings("unchecked")
    public List<Object[]> getByCategory() {
        String sql = "SELECT category, SUM(amount) FROM expenses GROUP BY category";
        return entityManager.createNativeQuery(sql).getResultList();
    }
    

    public List<Object[]> getCategoryWiseExpense() {
        String sql = "SELECT category, SUM(amount) FROM expenses GROUP BY category";
        return entityManager.createNativeQuery(sql).getResultList();
    }
    @Transactional
    public Expense save(Expense e) {
        entityManager.persist(e);
        return e;
    }

    @Transactional
    public Expense update(Expense e) {
        return entityManager.merge(e);
    }

    @Transactional
    public void delete(Long id) {
        Expense e = getById(id);
        if (e != null)
        	entityManager.remove(e);
    }

    @Transactional
    public Double getTotalExpense() {
        try {
            return entityManager.createQuery("SELECT SUM(e.amount) FROM Expense e WHERE e.status = 'PAID'", Double.class).getSingleResult();
        } catch (Exception ex) { return 0.0; }
    }
}