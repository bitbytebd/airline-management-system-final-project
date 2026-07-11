package com.cogent.dao;
 
import com.cogent.model.Payment;
import com.cogent.model.Payment.PaymentMethod;
import com.cogent.model.Payment.PaymentStatus;
import com.cogent.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
 
import java.util.List;
 
@Repository(value = "paymentDAO")
@Transactional
public class PaymentDAO {
 
    @Autowired
    private PaymentRepository repo;
 
    public List<Payment> getAll()                           { return repo.findAllByOrderByCreatedAtDesc(); }
    public Payment       getById(Long id)                   { return repo.findById(id).orElse(null); }
    public Payment       getByRef(String ref)               { return repo.findByPaymentReference(ref).orElse(null); }
    public Payment       getByTxRef(String txRef)           { return repo.findByTransactionReference(txRef).orElse(null); }
    public List<Payment> getByStatus(PaymentStatus s)       { return repo.findByStatusOrderByCreatedAtDesc(s); }
    public List<Payment> getByMethod(PaymentMethod m)       { return repo.findByPaymentMethodOrderByCreatedAtDesc(m); }
    public List<Payment> getByBookingId(Long bid)           { return repo.findByBookingIdOrderByCreatedAtDesc(bid); }
    public List<Payment> getByPassengerId(Long pid)         { return repo.findByPassengerIdOrderByCreatedAtDesc(pid); }
    public List<Payment> search(String q)                   { return repo.search("%" + q + "%"); }
    public boolean completedExistsForBooking(Long bid)      { return repo.existsByBookingIdAndStatus(bid, PaymentStatus.COMPLETED); }
 
    public Double getTotalRevenue()                         { return orZero(repo.getTotalRevenue()); }
    public Double getMonthlyRevenue()                       { return orZero(repo.getMonthlyRevenue()); }
    public Double getDailyRevenue()                         { return orZero(repo.getDailyRevenue()); }
    public long   countByStatus(PaymentStatus s)            { return repo.countByStatus(s); }
    public List<Object[]> getMonthlyStats()                 { return repo.getMonthlyStats(); }
    public List<Object[]> getMethodBreakdown()              { return repo.getMethodBreakdown(); }
 
    @Transactional public Payment save(Payment p)           { return repo.save(p); }
    @Transactional public Payment update(Payment p)         { return repo.save(p); }
    @Transactional public void    delete(Long id)           { repo.deleteById(id); }
 
    private Double orZero(Double d) { return d != null ? d : 0.0; }
}
 