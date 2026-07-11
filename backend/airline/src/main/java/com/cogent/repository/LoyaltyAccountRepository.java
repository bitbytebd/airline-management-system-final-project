package com.cogent.repository;
 
import com.cogent.model.LoyaltyAccount;
import com.cogent.model.LoyaltyAccount.LoyaltyTier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
 
import java.util.List;
import java.util.Optional;
 
@Repository
public interface LoyaltyAccountRepository extends JpaRepository<LoyaltyAccount, Long> {
 
    Optional<LoyaltyAccount> findByPassengerId(Long passengerId);
    Optional<LoyaltyAccount> findByMemberNumber(String memberNumber);
    boolean existsByPassengerId(Long passengerId);
    List<LoyaltyAccount> findByTierOrderByAvailablePointsDesc(LoyaltyTier tier);
    List<LoyaltyAccount> findByIsActiveTrueOrderByAvailablePointsDesc();
 
    // Keyword search (name + email + member number + passport)
    @Query("SELECT a FROM LoyaltyAccount a WHERE " +
           "LOWER(a.passengerName)  LIKE LOWER(:q) OR " +
           "LOWER(a.passengerEmail) LIKE LOWER(:q) OR " +
           "LOWER(a.memberNumber)   LIKE LOWER(:q) OR " +
           "LOWER(a.passportNumber) LIKE LOWER(:q) " +
           "ORDER BY a.availablePoints DESC")
    List<LoyaltyAccount> search(@Param("q") String query);
 
    // Autocomplete — first-letter / prefix search on name
    @Query("SELECT a FROM LoyaltyAccount a WHERE " +
           "LOWER(a.passengerName) LIKE LOWER(:prefix) OR " +
           "LOWER(a.memberNumber)  LIKE LOWER(:prefix) " +
           "ORDER BY a.passengerName ASC")
    List<LoyaltyAccount> autocomplete(@Param("prefix") String prefix);
 
    // Stats aggregates
    @Query("SELECT COUNT(a) FROM LoyaltyAccount a WHERE a.tier = :tier")
    long countByTier(@Param("tier") LoyaltyTier tier);
 
    @Query("SELECT COALESCE(SUM(a.totalPointsEarned), 0) FROM LoyaltyAccount a")
    Long sumTotalPointsEarned();
 
    @Query("SELECT COALESCE(SUM(a.totalPointsRedeemed), 0) FROM LoyaltyAccount a")
    Long sumTotalPointsRedeemed();
 
    @Query("SELECT COALESCE(SUM(a.availablePoints), 0) FROM LoyaltyAccount a")
    Long sumAvailablePoints();
 
    // Top earners leaderboard
    @Query("SELECT a FROM LoyaltyAccount a WHERE a.isActive = true " +
           "ORDER BY a.totalPointsEarned DESC")
    List<LoyaltyAccount> findTopEarners(org.springframework.data.domain.Pageable pageable);
}
 