package com.cogent.dao;
 
import com.cogent.model.LoyaltyAccount;
import com.cogent.model.LoyaltyAccount.LoyaltyTier;
import com.cogent.model.LoyaltyTransaction;
import com.cogent.model.LoyaltyTransaction.TransactionType;
import com.cogent.repository.LoyaltyAccountRepository;
import com.cogent.repository.LoyaltyTransactionRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;
 
import java.util.List;
 
@Repository(value = "loyaltyDAO")
@Transactional
public class LoyaltyDAO {
 
    @Autowired private LoyaltyAccountRepository     accountRepo;
    @Autowired private LoyaltyTransactionRepository txRepo;
 
    // ── Account CRUD ──────────────────────────────────────────────
    public List<LoyaltyAccount> getAllAccounts()                   { return accountRepo.findByIsActiveTrueOrderByAvailablePointsDesc(); }
    public LoyaltyAccount getAccountById(Long id)                 { return accountRepo.findById(id).orElse(null); }
    public LoyaltyAccount getAccountByPassengerId(Long pid)       { return accountRepo.findByPassengerId(pid).orElse(null); }
    public LoyaltyAccount getAccountByMemberNumber(String mn)     { return accountRepo.findByMemberNumber(mn).orElse(null); }
    public boolean accountExistsForPassenger(Long pid)            { return accountRepo.existsByPassengerId(pid); }
    public List<LoyaltyAccount> getByTier(LoyaltyTier tier)      { return accountRepo.findByTierOrderByAvailablePointsDesc(tier); }
    public List<LoyaltyAccount> search(String q)                  { return accountRepo.search("%" + q + "%"); }
    public List<LoyaltyAccount> autocomplete(String prefix)       { return accountRepo.autocomplete(prefix + "%"); }
    public List<LoyaltyAccount> getTopEarners(int limit)          { return accountRepo.findTopEarners(PageRequest.of(0, limit)); }
 
    @Transactional public LoyaltyAccount saveAccount(LoyaltyAccount a)  { return accountRepo.save(a); }
    @Transactional public LoyaltyAccount updateAccount(LoyaltyAccount a){ return accountRepo.save(a); }
    @Transactional public void deleteAccount(Long id)                    { accountRepo.deleteById(id); }
 
    // ── Account Stats ─────────────────────────────────────────────
    public long countByTier(LoyaltyTier tier)     { return accountRepo.countByTier(tier); }
    public Long sumTotalEarned()                  { return accountRepo.sumTotalPointsEarned(); }
    public Long sumTotalRedeemed()                { return accountRepo.sumTotalPointsRedeemed(); }
    public Long sumAvailable()                    { return accountRepo.sumAvailablePoints(); }
    public long countAllAccounts()                { return accountRepo.count(); }
 
    // ── Transaction CRUD ──────────────────────────────────────────
    public List<LoyaltyTransaction> getTransactionsByAccountId(Long aid)  { return txRepo.findByAccountIdOrderByCreatedAtDesc(aid); }
    public List<LoyaltyTransaction> getTransactionsByPassengerId(Long pid) { return txRepo.findByPassengerIdOrderByCreatedAtDesc(pid); }
    public List<LoyaltyTransaction> getAllTransactions()                   { return txRepo.findAll(); }
    public boolean earnedAlreadyForBooking(Long bookingId)                { return txRepo.existsByBookingIdAndTransactionType(bookingId, TransactionType.EARNED); }
 
    @Transactional public LoyaltyTransaction saveTransaction(LoyaltyTransaction t) { return txRepo.save(t); }
}