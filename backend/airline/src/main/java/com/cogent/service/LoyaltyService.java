package com.cogent.service;

// ═══════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/cogent/service/LoyaltyService.java
// ═══════════════════════════════════════════════════════════════════

import com.cogent.dao.LoyaltyDAO;
import com.cogent.dto.LoyaltyDTO.*;
import com.cogent.model.LoyaltyAccount;
import com.cogent.model.LoyaltyAccount.LoyaltyTier;
import com.cogent.model.LoyaltyTransaction;
import com.cogent.model.LoyaltyTransaction.TransactionType;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service(value = "loyaltyService")
@Transactional
public class LoyaltyService {

    @Autowired private LoyaltyDAO loyaltyDAO;

    // Redemption Rate: 100 points = 1 USD 
    private static final int    POINTS_PER_BDT   = 100;
    
    // Base earn rate: 1 point per 10 km 
    private static final double KM_PER_BASE_POINT = 10.0;

    // ── Class multipliers ─────────────────────────────────────────
      private static final double MULT_ECONOMY    = 1.00;
      
      private static final double MULT_PREMIUM    = 1.50;
      
      private static final double MULT_BUSINESS   = 2.00;
      
      private static final double MULT_FIRST      = 3.00;

    // Tier bonus points on promotion 
      private static final int BONUS_SILVER   =  500;
      private static final int BONUS_GOLD     = 1500;
      private static final int BONUS_PLATINUM = 5000;

    // ═══════════════════════════════════════════════════════════════
    //  READS
    // ═══════════════════════════════════════════════════════════════
    public List<LoyaltyAccount> getAll() {
    	return loyaltyDAO.getAllAccounts();
    	}
    
    public LoyaltyAccount getById(Long id) { 
    	return loyaltyDAO.getAccountById(id);
    	  }
    public LoyaltyAccount getByPassengerId(Long pid){
    	return loyaltyDAO.getAccountByPassengerId(pid);
    	}
    
    public LoyaltyAccount getByMemberNumber(String mn) {
    	return loyaltyDAO.getAccountByMemberNumber(mn);
    	}
    
    public List<LoyaltyAccount> getByTier(String tier) { 
    	return loyaltyDAO.getByTier(LoyaltyTier.valueOf(tier.toUpperCase()));
    	}
    
    public List<LoyaltyAccount> search(String q) { 
    	return loyaltyDAO.search(q);
    	}
    
    public List<LoyaltyAccount> autocomplete(String prefix) {
    	return loyaltyDAO.autocomplete(prefix);
    	}
    
    public List<LoyaltyAccount> getTopEarners(int limit) {
    	return loyaltyDAO.getTopEarners(limit > 0 ? limit : 10); 
    	}
    
    public List<LoyaltyTransaction> getTransactions(Long aid){
    	return loyaltyDAO.getTransactionsByAccountId(aid); 
    	}
    
    public List<LoyaltyTransaction> getTransactionsByPassenger(Long pid) { return loyaltyDAO.getTransactionsByPassengerId(pid); }

    // ═══════════════════════════════════════════════════════════════
    //  ENROLL
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public LoyaltyAccount enroll(EnrollRequest req) {
        if (loyaltyDAO.accountExistsForPassenger(req.getPassengerId()))
        	
            throw new RuntimeException("Loyalty account already exists for passenger: " + req.getPassengerId());

        LoyaltyAccount loyaltyAccount = new LoyaltyAccount();
                         loyaltyAccount.setMemberNumber(generateMemberNumber());
                         loyaltyAccount.setPassengerId(req.getPassengerId());
                         loyaltyAccount.setPassengerName(req.getPassengerName());
                         loyaltyAccount.setPassengerEmail(req.getPassengerEmail());
                         loyaltyAccount.setPassportNumber(req.getPassportNumber());
                         loyaltyAccount.setPhoneNumber(req.getPhoneNumber());
                         loyaltyAccount.setTier(LoyaltyTier.BRONZE);
                         loyaltyAccount.setTierQualifyingPoints(0);
                           loyaltyAccount.setAvailablePoints(0);
                      loyaltyAccount.setTotalPointsEarned(0);
                      loyaltyAccount.setTotalPointsRedeemed(0);
                      loyaltyAccount.setTotalFlightsTaken(0);
                      loyaltyAccount.setTotalMilesFlown(0.0);
                      loyaltyAccount.setIsActive(true);
                      loyaltyAccount.setEnrolledDate(LocalDateTime.now());
                      loyaltyAccount.setCreatedAt(LocalDateTime.now());
                      loyaltyAccount.setUpdatedAt(LocalDateTime.now());
                       
        // Points expire 1 year from last activity
                       
                      loyaltyAccount.setPointsExpiryDate(LocalDateTime.now().plusYears(1));
                      loyaltyAccount.setTierExpiryDate(LocalDateTime.now().plusYears(1));

        return loyaltyDAO.saveAccount(loyaltyAccount);
    }

    // ═══════════════════════════════════════════════════════════════
    //  AWARD POINTS (after confirmed booking)
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public LoyaltyTransaction awardPoints(Long accountId, AwardRequest req) {
        LoyaltyAccount account = requireAccount(accountId);

        // Guard: don't double-award same booking
        if (req.getBookingId() != null && loyaltyDAO.earnedAlreadyForBooking(req.getBookingId()))
            throw new RuntimeException("Points already awarded for booking: " + req.getBookingId());

        // Calculate base points
        double distKm      = req.getDistanceKm() != null && req.getDistanceKm() > 0 ? req.getDistanceKm() : 0;
        double classMulti  = getClassMultiplier(req.getClassType());
        double tierMulti   = LoyaltyAccount.getTierMultiplier(account.getTier());
        int    basePoints  = (int) Math.max(Math.round((distKm / KM_PER_BASE_POINT) * classMulti * tierMulti), 10);

        // Check for tier upgrade
        LoyaltyTier oldTier = account.getTier();

        // use for Update account
        account.setTotalPointsEarned(account.getTotalPointsEarned() + basePoints);
        account.setTierQualifyingPoints(account.getTierQualifyingPoints() + basePoints);
        account.setAvailablePoints(account.getAvailablePoints() + basePoints);
        account.setTotalFlightsTaken(account.getTotalFlightsTaken() + 1);
        account.setTotalMilesFlown(account.getTotalMilesFlown() + distKm);
        account.setLastActivityDate(LocalDateTime.now());
        account.setLastFlightNumber(req.getFlightNumber());
        account.setPointsExpiryDate(LocalDateTime.now().plusYears(1));  // Reset on activity
        account.setUpdatedAt(LocalDateTime.now());
        account.recalculateTier();

        loyaltyDAO.updateAccount(account);

        // Create earn transaction for loyalty members
        LoyaltyTransaction tx = buildTransaction(account, TransactionType.EARNED, basePoints, req.getBookingId());
        tx.setBookingReference(req.getBookingReference());
        tx.setFlightNumber(req.getFlightNumber());
        tx.setFlightRoute(req.getOrigin() + " → " + req.getDestination());
        tx.setClassType(req.getClassType());
        tx.setDistanceKm(distKm);
        tx.setTierMultiplier(tierMulti);
        tx.setDescription(req.getDescription() != null ? req.getDescription()
                : "Points earned: " + req.getFlightNumber() + " (" + req.getClassType() + ")");
        tx.setCreatedBy(req.getAwardedBy());
        LoyaltyTransaction saved = loyaltyDAO.saveTransaction(tx);

        // Issue tier promotion bonus if tier upgraded
        if (account.getTier() != oldTier) {
            awardTierBonus(account, account.getTier());
        }

        return saved;
    }

 
    //  REDEEM POINTS

    @Transactional
    public LoyaltyTransaction redeemPoints(Long accountId, RedeemRequest req) {
        LoyaltyAccount account = requireAccount(accountId);
        int toRedeem = req.getPointsToRedeem();

        if (toRedeem <= 0)          throw new RuntimeException("Points to redeem must be greater than zero.");
        if (toRedeem % 100 != 0)    throw new RuntimeException("Points must be redeemed in multiples of 100.");
        if (toRedeem > account.getAvailablePoints())
            throw new RuntimeException("Insufficient points. Available: " + account.getAvailablePoints());

        double bdtValue = (double) toRedeem / POINTS_PER_BDT;
        String redemptionRef = "RED-" + generateRef();

        account.setTotalPointsRedeemed(account.getTotalPointsRedeemed() + toRedeem);
        account.setAvailablePoints(account.getAvailablePoints() - toRedeem);
        account.setLastActivityDate(LocalDateTime.now());
        account.setUpdatedAt(LocalDateTime.now());
        account.recalculateTier();
        loyaltyDAO.updateAccount(account);

        LoyaltyTransaction tx = buildTransaction(account, TransactionType.REDEEMED, -toRedeem, null);
        tx.setRedemptionValue(bdtValue);
        tx.setRedemptionReference(redemptionRef);
        tx.setBookingReference(req.getBookingReference());
        tx.setDescription("Redeemed " + toRedeem + " pts = BDT " + String.format("%.2f", bdtValue));
        tx.setCreatedBy(req.getRedeemedBy());
        return loyaltyDAO.saveTransaction(tx);
    }

    // ── Preview redemption (no DB change) ────────────────────────
    public RedemptionPreview previewRedemption(Long accountId, Integer points) {
        LoyaltyAccount acc = requireAccount(accountId);
        if (points == null || points <= 0) throw new RuntimeException("Invalid points amount.");
        if (points > acc.getAvailablePoints())
            throw new RuntimeException("Insufficient points. Available: " + acc.getAvailablePoints());

        RedemptionPreview preview = new RedemptionPreview();
        preview.setPointsToRedeem(points);
        preview.setAvailablePoints(acc.getAvailablePoints());
        preview.setDiscountValueBDT(round2((double) points / POINTS_PER_BDT));
        preview.setRemainingPoints(acc.getAvailablePoints() - points);
        return preview;
    }

    // ═══════════════════════════════════════════════════════════════
    //  MANUAL BONUS (admin)
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public LoyaltyTransaction awardBonus(Long accountId, BonusRequest req) {
        LoyaltyAccount account = requireAccount(accountId);
        int bonus = req.getBonusPoints();
        if (bonus <= 0) throw new RuntimeException("Bonus points must be positive.");

        account.setTotalPointsEarned(account.getTotalPointsEarned() + bonus);
        account.setAvailablePoints(account.getAvailablePoints() + bonus);
        account.setUpdatedAt(LocalDateTime.now());
        account.setPointsExpiryDate(LocalDateTime.now().plusYears(1));
        loyaltyDAO.updateAccount(account);

        LoyaltyTransaction tx = buildTransaction(account, TransactionType.BONUS, bonus, null);
        tx.setDescription(req.getReason() != null ? req.getReason() : "Admin bonus award");
        tx.setCreatedBy(req.getAwardedBy());
        return loyaltyDAO.saveTransaction(tx);
    }

    // ═══════════════════════════════════════════════════════════════
    //  STATS
    // ═══════════════════════════════════════════════════════════════
    public LoyaltyStats getStats() {
        LoyaltyStats s = new LoyaltyStats();
        s.setTotalMembers(loyaltyDAO.countAllAccounts());
        s.setBronzeCount(loyaltyDAO.countByTier(LoyaltyTier.BRONZE));
        s.setSilverCount(loyaltyDAO.countByTier(LoyaltyTier.SILVER));
        s.setGoldCount(loyaltyDAO.countByTier(LoyaltyTier.GOLD));
        s.setPlatinumCount(loyaltyDAO.countByTier(LoyaltyTier.PLATINUM));
        s.setTotalPointsEverIssued(loyaltyDAO.sumTotalEarned());
        s.setTotalPointsRedeemed(loyaltyDAO.sumTotalRedeemed());
        s.setTotalAvailablePoints(loyaltyDAO.sumAvailable());
        Long redeemed = loyaltyDAO.sumTotalRedeemed();
        s.setTotalRedeemedValueBDT(redeemed != null ? round2((double) redeemed / POINTS_PER_BDT) : 0.0);
        return s;
    }

    // ═══════════════════════════════════════════════════════════════
    //  DEACTIVATE / REACTIVATE
    // ═══════════════════════════════════════════════════════════════
    @Transactional
    public LoyaltyAccount toggleActive(Long accountId) {
        LoyaltyAccount account = requireAccount(accountId);
        account.setIsActive(!account.getIsActive());
        account.setUpdatedAt(LocalDateTime.now());
        return loyaltyDAO.updateAccount(account);
    }

    // ═══════════════════════════════════════════════════════════════
    //  HELPERS
    // ═══════════════════════════════════════════════════════════════
    private LoyaltyAccount requireAccount(Long id) {
        LoyaltyAccount a = loyaltyDAO.getAccountById(id);
        if (a == null) throw new RuntimeException("Loyalty account not found: " + id);
        if (!a.getIsActive()) throw new RuntimeException("Loyalty account is inactive: " + id);
        return a;
    }

    private LoyaltyTransaction buildTransaction(LoyaltyAccount acc,
                                                TransactionType type, int points, Long bookingId) {
        LoyaltyTransaction t = new LoyaltyTransaction();
        t.setAccountId(acc.getId());
        t.setPassengerId(acc.getPassengerId());
        t.setPassengerName(acc.getPassengerName());
        t.setMemberNumber(acc.getMemberNumber());
        t.setTransactionType(type);
        t.setPointsAmount(points);
        t.setBalanceAfter(acc.getAvailablePoints());
        t.setBookingId(bookingId);
        t.setCreatedAt(LocalDateTime.now());
        return t;
    }

    @Transactional
    private void awardTierBonus(LoyaltyAccount account, LoyaltyTier newTier) {
        int bonus = switch (newTier) {
            case SILVER   -> BONUS_SILVER;
            case GOLD     -> BONUS_GOLD;
            case PLATINUM -> BONUS_PLATINUM;
            default       -> 0;
        };
        if (bonus == 0) return;
        account.setTotalPointsEarned(account.getTotalPointsEarned() + bonus);
        account.setAvailablePoints(account.getAvailablePoints() + bonus);
        account.setUpdatedAt(LocalDateTime.now());
        loyaltyDAO.updateAccount(account);

        LoyaltyTransaction tx = buildTransaction(account, TransactionType.TIER_BONUS, bonus, null);
        tx.setDescription("🎉 Welcome to " + newTier.name() + "! Bonus " + bonus + " points awarded.");
        loyaltyDAO.saveTransaction(tx);
    }

    private double getClassMultiplier(String classType) {
        if (classType == null) return MULT_ECONOMY;
        return switch (classType.toUpperCase()) {
            case "PREMIUM", "PREMIUM_ECONOMY" -> MULT_PREMIUM;
            case "BUSINESS"                   -> MULT_BUSINESS;
            case "FIRST_CLASS", "FIRST"       -> MULT_FIRST;
            default                           -> MULT_ECONOMY;
        };
    }

    private String generateMemberNumber() {
        String digits = String.format("%08d", new Random().nextInt(100_000_000));
        return "SKY-" + digits;
    }

    private String generateRef() {
        String c = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
        Random r = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 8; i++) sb.append(c.charAt(r.nextInt(c.length())));
        return sb.toString();
    }

    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }
}