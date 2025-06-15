package com.example.auth_service.controller;

import com.example.auth_service.dto.UserDTO;
import com.example.auth_service.model.User;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDto) {
        Optional<User> userOpt = userRepository.findByUsername(userDto.getUsername());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body("❌ Användare finns inte");
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(userDto.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("❌ Fel lösenord");
        }

        try {
            String token = JwtUtil.generateToken(user.getUsername(), user.getRole());
            return ResponseEntity.ok().body(token);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("❌ Kunde inte generera token");
        }
    }

    // 📝 Registrering
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO userDto) {
        if (userRepository.findByUsername(userDto.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("❌ Användarnamnet är redan taget");
        }

        User newUser = new User();
        newUser.setUsername(userDto.getUsername());
        newUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        newUser.setRole(userDto.getRole() != null ? userDto.getRole() : "ROLE_USER");

        userRepository.save(newUser);
        return ResponseEntity.ok("✅ Användare registrerad");
    }
}
