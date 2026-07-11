package com.cogent.service;

import com.cogent.model.AppUser;
import com.cogent.repository.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class AppUserService {
	
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private static final long MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
    private static final Set<String> ALLOWED_PROFILE_IMAGE_TYPES = Set.of("jpg", "jpeg", "png", "webp");
    private static final Path PROFILE_IMAGE_DIR = Paths.get("uploads", "profile-images");

    public AppUserService(AppUserRepository repository, PasswordEncoder passwordEncoder) {
        this.userRepository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<AppUser> getAll() {
        return userRepository.findAllByOrderByCreatedAtDesc();
    }

    public AppUser getById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public Optional<AppUser> findByLogin(String login) {
        String value = login == null ? "" : login.trim();
        if (value.isEmpty()) return Optional.empty();
        Optional<AppUser> byUsernameOrEmail = userRepository.findFirstByUsernameIgnoreCaseOrEmailIgnoreCase(value, value);
        return byUsernameOrEmail.isPresent() ? byUsernameOrEmail : userRepository.findFirstByEmployeeCodeIgnoreCase(value);
    }

    public AppUser create(AppUser user) {
        user.setPassword(encodePasswordIfNeeded(user.getPassword()));
        return userRepository.save(user);
    }

    public AppUser update(Long id, AppUser details) {
    	
    	//FIND USER BY id and update userdetails
        return userRepository.findById(id).map(user -> {
        	//update employee information
            user.setEmployeeCode(details.getEmployeeCode());
            
            //updates personal information
            user.setFullName(details.getFullName());
            user.setUsername(details.getUsername());
            user.setEmail(details.getEmail());
            user.setPhoneNumber(details.getPhoneNumber());
            if (!isBlank(details.getPassword())) {
                user.setPassword(encodePasswordIfNeeded(details.getPassword()));
            }
            
            //updates role and department information
              user.setRole(details.getRole());
             user.setDepartment(details.getDepartment());
             
             // Update assigned station or  location
              user.setStation(details.getStation());
              
              // Update account status
            user.setStatus(details.getStatus());
            
            // Update last login mtimestamp
            user.setLastLoginAt(details.getLastLoginAt());
            
            //save update user into database
            return userRepository.save(user);
        }).orElse(null);
    }

    public AppUser markLoginSuccess(AppUser user) {
        user.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public AppUser uploadProfileImage(Long id, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Profile image is required.");
        }
        if (file.getSize() > MAX_PROFILE_IMAGE_SIZE) {
            throw new IllegalArgumentException("Profile image must be 5MB or smaller.");
        }

        String extension = getExtension(file.getOriginalFilename());
        if (!ALLOWED_PROFILE_IMAGE_TYPES.contains(extension)) {
            throw new IllegalArgumentException("Only JPG, JPEG, PNG, and WEBP images are allowed.");
        }

        AppUser user = getById(id);
        if (user == null) {
            return null;
        }

        Files.createDirectories(PROFILE_IMAGE_DIR);
        String filename = "user-" + id + "-" + UUID.randomUUID() + "." + extension;
        Path target = PROFILE_IMAGE_DIR.resolve(filename).normalize();
        Files.copy(file.getInputStream(), target);

        user.setProfileImageUrl("/uploads/profile-images/" + filename);
        return userRepository.save(user);
    }

    public Path getProfileImagePath(String filename) {
        if (filename == null || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return null;
        }
        Path path = PROFILE_IMAGE_DIR.resolve(filename).normalize();
        return Files.exists(path) ? path : null;
    }

    public void delete(Long id) {
    	userRepository.deleteById(id);
    }

    private String encodePasswordIfNeeded(String password) {
        if (isBlank(password)) return null;
        String value = password.trim();
        return value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$")
                ? value
                : passwordEncoder.encode(value);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }
}
