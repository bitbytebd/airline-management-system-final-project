package com.cogent.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path profileImagePath = Paths.get("uploads", "profile-images").toAbsolutePath().normalize();
        registry.addResourceHandler("/uploads/profile-images/**")
                .addResourceLocations(profileImagePath.toUri().toString());
    }
}
