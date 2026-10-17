package com.reservaYa.RYV1.Service;

import com.reservaYa.RYV1.Model.ERole;
import com.reservaYa.RYV1.Model.Role;
import com.reservaYa.RYV1.Model.User;
import com.reservaYa.RYV1.Repository.RoleRepository;
import com.reservaYa.RYV1.Repository.UserRepository;
import com.reservaYa.RYV1.dto.JwtResponse;
import com.reservaYa.RYV1.dto.LoginRequest;
import com.reservaYa.RYV1.dto.RegisterRequest;
import com.reservaYa.RYV1.security.jwt.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtUtils jwtUtils,
            PasswordEncoder passwordEncoder,
            UserRepository userRepository,
            RoleRepository roleRepository) {

        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    public JwtResponse login(LoginRequest request) {

        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var userDetails =
                (org.springframework.security.core.userdetails.UserDetails)
                        authentication.getPrincipal();

        String jwt = jwtUtils.generateJwtToken(
                userDetails.getUsername(),
                userDetails.getAuthorities()
        );

        return new JwtResponse(jwt);
    }

    @Transactional
    public void register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "Ya existe una cuenta registrada con ese email"
            );
        }

        Role userRole = roleRepository.findByNameRole(ERole.ROLE_USER)
                .orElseThrow(() ->
                        new IllegalStateException("No se encontró el rol ROLE_USER")
                );

        User user = new User();
        user.setName(request.getName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(userRole));

        userRepository.save(user);
    }
}

