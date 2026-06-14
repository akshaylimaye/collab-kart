package com.collabkart.config;

import com.collabkart.entity.Role;
import com.collabkart.entity.User;
import com.collabkart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("dev")
@RequiredArgsConstructor
public class DevAdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.dev-admin.email:admin@collabkart.local}")
    private String adminEmail;

    @Value("${app.dev-admin.password:Admin@12345}")
    private String adminPassword;

    @Value("${app.dev-admin.name:Dev Admin}")
    private String adminName;

    @Override
    public void run(String... args) {
        String email = adminEmail.trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            return;
        }

        User admin = User.builder()
                .name(adminName.trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .build();

        userRepository.save(admin);
    }
}
