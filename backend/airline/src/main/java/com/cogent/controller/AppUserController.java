package com.cogent.controller;

import com.cogent.model.AppUser;
import com.cogent.service.AppUserService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200")

public class AppUserController {
	
    private final AppUserService appServices;

    public AppUserController(AppUserService service) {
    	
           this.appServices = service;
    }

    //AppUser class(all data getting)
    @GetMapping
    public ResponseEntity<?> getAll(Authentication authentication) {//list type <AppUser>
        if (!canManageUsers(authentication)) {
            return ResponseEntity.status(authentication == null ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("message", "Only administrators can view user profiles."));
        }
        return ResponseEntity.ok(appServices.getAll());
    }

    //using get mapping(data getting by id)
    @GetMapping("/{id}")
      public  ResponseEntity<?> getById(@PathVariable Long id, Authentication authentication) {
        if (!canViewUser(id, authentication)) {
            return ResponseEntity.status(authentication == null ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("message", "You can view only your own profile."));
        }
        AppUser users = appServices.getById(id);
        return users != null ? ResponseEntity.ok(users) : ResponseEntity.notFound().build();
    }

    @PostMapping
      public ResponseEntity<?> create(@RequestBody AppUser user, Authentication authentication) {
        if (!canManageUsers(authentication)) {
            return ResponseEntity.status(authentication == null ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("message", "Only administrators can create users."));
        }
        return ResponseEntity.ok(appServices.create(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody AppUser users, Authentication authentication) {
        if (!canManageUsers(authentication)) {
            return ResponseEntity.status(authentication == null ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("message", "Only administrators can update users."));
        }
        AppUser updates = appServices.update(id, users);
        
        return updates != null ? ResponseEntity.ok(updates) : ResponseEntity.notFound().build();
    }

    @PostMapping(value = "/{id}/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfileImage(@PathVariable Long id,
                                                @RequestParam("file") MultipartFile file,
                                                Authentication authentication) {
        try {
            if (!canUpdateOwnProfile(id, authentication)) {
                return ResponseEntity.status(authentication == null ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN)
                        .body(java.util.Map.of("message", "You can update only your own profile photo."));
            }
            AppUser updated = appServices.uploadProfileImage(id, file);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", ex.getMessage()));
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("message", "Profile image could not be saved."));
        }
    }

    @GetMapping("/profile-images/{filename:.+}")
    public ResponseEntity<Resource> getProfileImage(@PathVariable String filename) {
        Path path = appServices.getProfileImagePath(filename);
        if (path == null) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new FileSystemResource(path);
        return ResponseEntity.ok()
                .contentType(resolveImageMediaType(filename))
                .body(resource);
    }

    private boolean canUpdateOwnProfile(Long id, Authentication authentication) {
        if (id == null || authentication == null || authentication.getName() == null) {
            return false;
        }
        return appServices.findByLogin(authentication.getName())
                .map(user -> id.equals(user.getId()))
                .orElse(false);
    }

    //deleting(id used)
    @DeleteMapping("/{id}")
    
    public ResponseEntity<?> delete(@PathVariable Long id, Authentication authentication) {
        if (!canManageUsers(authentication)) {
            return ResponseEntity.status(authentication == null ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN)
                    .body(java.util.Map.of("message", "Only administrators can delete users."));
        }
    	appServices.delete(id);
          return  ResponseEntity.ok().build();
    }

    private boolean canViewUser(Long id, Authentication authentication) {
        return canManageUsers(authentication) || canUpdateOwnProfile(id, authentication);
    }

    private boolean canManageUsers(Authentication authentication) {
        if (authentication == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> "ROLE_SUPER_ADMIN".equals(role) || "ROLE_ADMIN".equals(role));
    }

    private MediaType resolveImageMediaType(String filename) {
        String lower = filename == null ? "" : filename.toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return MediaType.IMAGE_JPEG;
    }
}
