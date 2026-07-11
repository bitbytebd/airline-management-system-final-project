package com.cogent.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String category;
    private Double amount;

    @Column(name = "expense_date")
    private LocalDate expenseDate;

    private String description;

    @Column(name = "vendor_name")
    private String vendorName;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "reference_no")
    private String referenceNo;

    private String department;
    private String status;

    @Column(name = "booking_reference")
    private String bookingReference;

    // Constructors, Getters and Setters
    public Expense() {}

    public Long getId() {
    	return id; }
    
    public void setId(Long id) { 
    	this.id = id; }
    
    public String getCategory() {
    	return category; }
    
    public void setCategory(String category) {
         this.category = category; }
    
    public Double getAmount() { 
    	   return amount; }
    public void setAmount(Double amount) {
    	   this.amount = amount; }
    
    public LocalDate getExpenseDate() { 
    	      return expenseDate; }
    
    public void setExpenseDate(LocalDate expenseDate) {
    	          this.expenseDate = expenseDate; }
    
    public String getDescription() { 
    	            return description; }
    
    public void setDescription(String description) {
    	           this.description = description; }
    
    public String getVendorName() { 
    	               return vendorName; }
    
    public void setVendorName(String vendorName) {
    	                  this.vendorName = vendorName; }
    
    
    public String getPaymentMethod() { 
    	             return paymentMethod; }
    
    public void setPaymentMethod(String paymentMethod) {
    	           this.paymentMethod = paymentMethod; }
    
    public String getReferenceNo() { 
    	                 return referenceNo; }
    
    public void setReferenceNo(String referenceNo) {
    	                   this.referenceNo = referenceNo; }
    
    public String getDepartment() { 
    	                return department; }
    
    public void setDepartment(String department) {
    	               this.department = department; }
    
    public String getStatus() { 
    	            return status; }
    
    public void setStatus(String status) { 
    	                this.status = status; }
    
    public String getBookingReference() { 
    	             return bookingReference; }
    
    public void setBookingReference(String bookingReference) { 
    	               this.bookingReference = bookingReference; }
}