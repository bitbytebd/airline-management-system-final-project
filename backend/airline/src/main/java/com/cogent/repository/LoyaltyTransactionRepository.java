package com.cogent.repository;
 
import com.cogent.model.LoyaltyTransaction;
import com.cogent.model.LoyaltyTransaction.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
 
import java.util.List;
 
@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Long> {
 
    List<LoyaltyTransaction> findByAccountIdOrderByCreatedAtDesc(Long accountId);
    List<LoyaltyTransaction> findByPassengerIdOrderByCreatedAtDesc(Long passengerId);
    List<LoyaltyTransaction> findByTransactionTypeOrderByCreatedAtDesc(TransactionType type);
    boolean existsByBookingIdAndTransactionType(Long bookingId, TransactionType type);
 
    @Query("SELECT COALESCE(SUM(t.pointsAmount), 0) FROM LoyaltyTransaction t " +
           "WHERE t.accountId = :aid AND t.transactionType = 'EARNED'")
    Integer sumEarnedByAccount(@Param("aid") Long accountId);
 
    @Query("SELECT COUNT(t) FROM LoyaltyTransaction t WHERE t.transactionType = :type")
    long countByType(@Param("type") TransactionType type);
}
 
 