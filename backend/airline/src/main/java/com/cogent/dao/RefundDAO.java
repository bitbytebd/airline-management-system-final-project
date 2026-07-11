package com.cogent.dao;
 
import com.cogent.model.Refund;
import com.cogent.model.Refund.RefundStatus;
import com.cogent.repository.RefundRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import java.util.List;
 
@Repository(value = "refundDAO")
@Transactional
public class RefundDAO {
 
    @Autowired
    private RefundRepository repo;
 
    public List<Refund> getAll()                            { return repo.findAllByOrderByRequestedAtDesc(); }
    public Refund getById(Long id)                          { return repo.findById(id).orElse(null); }
    public Refund getByRef(String ref)                      { return repo.findByRefundReference(ref).orElse(null); }
    public List<Refund> getByStatus(RefundStatus s)         { return repo.findByStatusOrderByRequestedAtDesc(s); }
    public List<Refund> getPending()                        { return repo.findAllPending(); }
    public List<Refund> getByBookingId(Long bid)            { return repo.findByBookingIdOrderByRequestedAtDesc(bid); }
    public List<Refund> getByPassengerId(Long pid)          { return repo.findByPassengerIdOrderByRequestedAtDesc(pid); }
    public List<Refund> search(String keyword)              { return repo.search("%" + keyword + "%"); }
    public boolean existsForBooking(Long bid)               { return repo.existsByBookingIdAndStatusNot(bid, RefundStatus.REJECTED); }
    public Double getTotalRefunded()                        { return orZero(repo.getTotalRefunded()); }
    public Double getTotalPenalty()                         { return orZero(repo.getTotalPenalty()); }
    public long countByStatus(RefundStatus s)               { return repo.countByStatus(s); }
 
    @Transactional public Refund save(Refund r)             { return repo.save(r); }
    @Transactional public Refund update(Refund r)           { return repo.save(r); }
    @Transactional public void delete(Long id)              { repo.deleteById(id); }
 
    private Double orZero(Double d) { return d != null ? d : 0.0; }
}
 