package com.towntrek.controller;

import com.towntrek.dao.AuthDAO;
import com.towntrek.dto.AuthResponse;
import com.towntrek.dto.LoginRequest;
import com.towntrek.dto.RegisterRequest;
import com.towntrek.model.UserAccount;
import com.towntrek.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthDAO authDAO;
    private final JwtUtil jwtUtil;

    public AuthController(AuthDAO authDAO, JwtUtil jwtUtil) {
        this.authDAO = authDAO;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            boolean created = authDAO.register(request.getFullName(), request.getEmail(), request.getPassword());
            if (!created) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(AuthResponse.error("An account with this email already exists."));
            }

            UserAccount user = authDAO.authenticate(request.getEmail(), request.getPassword());
            if (user == null) {
                return ResponseEntity.ok(AuthResponse.error("Registration succeeded. Please log in."));
            }

            String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), user.getFullName());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(AuthResponse.success(token, user.getUserId(), user.getFullName(), user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.error("Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            UserAccount user = authDAO.authenticate(request.getEmail(), request.getPassword());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(AuthResponse.error("Invalid email address or password."));
            }

            String token = jwtUtil.generateToken(user.getUserId(), user.getEmail(), user.getFullName());
            return ResponseEntity.ok(AuthResponse.success(token, user.getUserId(), user.getFullName(), user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AuthResponse.error("Authentication error: " + e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        try {
            String token = authHeader.substring(7);
            var claims = jwtUtil.validateAndGetClaims(token);
            String email = claims.getSubject();
            UserAccount user = authDAO.findByEmail(email);
            if (user != null) {
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired session token");
        }
    }
}

