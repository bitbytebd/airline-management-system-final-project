package com.cogent.repository;

import com.cogent.model.Coupon;
import com.cogent.model.Coupon.CouponStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCase(String code);
    List<Coupon> findByStatusOrderByValidUntilAsc(CouponStatus status);
    List<Coupon> findAllByOrderByCreatedAtDesc();

    @Query("SELECT c FROM Coupon c WHERE " +
           "LOWER(c.code) LIKE LOWER(:q) OR " +
           "LOWER(c.title) LIKE LOWER(:q) OR " +
           "LOWER(c.applicableRoute) LIKE LOWER(:q) " +
           "ORDER BY c.createdAt DESC")
    List<Coupon> search(@Param("q") String query);
}
