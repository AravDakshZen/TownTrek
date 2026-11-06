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

import java.util.Map;

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
            String city = (request.getCity() != null && !request.getCity().isBlank()) ? request.getCity() : "Chennai";
            boolean created = authDAO.register(request.getFullName(), request.getEmail(), request.getPassword(), city);
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
                    .body(AuthResponse.success(token, user.getUserId(), user.getFullName(), user.getEmail(), user.getCity()));
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
            return ResponseEntity.ok(AuthResponse.success(token, user.getUserId(), user.getFullName(), user.getEmail(), user.getCity()));
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

    @PutMapping("/city")
    public ResponseEntity<?> updateCity(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body
    ) {
        String city = body.get("city");
        if (city == null || city.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "City is required"));
        }
        String finalCity = city.trim();
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                var claims = jwtUtil.validateAndGetClaims(token);
                String email = claims.getSubject();
                authDAO.updateCityByEmail(email, finalCity);
                return ResponseEntity.ok(Map.of("success", true, "city", finalCity));
            } catch (Exception ignored) {
            }
        }
        return ResponseEntity.ok(Map.of("success", true, "city", finalCity));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }
        try {
            String token = authHeader.substring(7);
            var claims = jwtUtil.validateAndGetClaims(token);
            String currentEmail = claims.getSubject();

            String newName = body.get("fullName");
            String newEmail = body.get("email");
            String newCity = body.get("city");

            boolean ok = authDAO.updateUserProfile(currentEmail, newName, newEmail, newCity);
            String effectiveEmail = (newEmail != null && !newEmail.isBlank()) ? newEmail.trim() : currentEmail;
            UserAccount updated = authDAO.findByEmail(effectiveEmail);
            if (updated == null) updated = authDAO.findByEmail(currentEmail);

            if (updated != null) {
                String newToken = jwtUtil.generateToken(updated.getUserId(), updated.getEmail(), updated.getFullName());
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "token", newToken,
                        "userId", updated.getUserId(),
                        "fullName", updated.getFullName(),
                        "email", updated.getEmail(),
                        "city", updated.getCity()
                ));
            }
            return ResponseEntity.ok(Map.of("success", ok));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Update failed: " + ex.getMessage()));
        }
    }
}
