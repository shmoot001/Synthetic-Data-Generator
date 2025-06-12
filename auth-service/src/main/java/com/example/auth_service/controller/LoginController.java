package com.example.auth_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.auth_service.model.UserDTO;
import com.example.auth_service.util.JwtUtil;

@RestController
@RequestMapping("/auth")
public class LoginController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO user) throws Exception {
        
        System.out.println("Login attempt for user: " + user.getUsername());

        if ("admin".equals(user.getUsername()) && "admin".equals(user.getPassword())) {
            String token = JwtUtil.generateToken(user.getUsername(), "ROLE_ADMIN");
            return ResponseEntity.ok().body(token);
        } else {
            return ResponseEntity.status(401).body("Unauthorized");
        }
    }
}
