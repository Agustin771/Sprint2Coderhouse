package com.reservaYa.RYV1.Controller;

import com.reservaYa.RYV1.Service.AuthService;
import com.reservaYa.RYV1.dto.JwtResponse;
import com.reservaYa.RYV1.dto.LoginRequest;
import com.reservaYa.RYV1.dto.RegisterRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public JwtResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body("Usuario registrado correctamente");
    }
}

