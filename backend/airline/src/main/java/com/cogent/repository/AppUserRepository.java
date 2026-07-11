package com.cogent.repository;

import com.cogent.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    List<AppUser> findAllByOrderByCreatedAtDesc();
    Optional<AppUser> findFirstByUsernameIgnoreCaseOrEmailIgnoreCase(String username, String email);
    Optional<AppUser> findFirstByEmployeeCodeIgnoreCase(String employeeCode);
}
