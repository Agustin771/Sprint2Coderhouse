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

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    @Test
    void loginCorrectoDebeGenerarJwt() {
        LoginRequest request = new LoginRequest();
        request.setEmail("usuario@test.com");
        request.setPassword("clave123");

        UserDetails userDetails =
                new org.springframework.security.core.userdetails.User(
                        "usuario@test.com",
                        "password-encriptado",
                        List.of(new SimpleGrantedAuthority("ROLE_USER"))
                );

        when(authenticationManager.authenticate(any(
                UsernamePasswordAuthenticationToken.class
        ))).thenReturn(authentication);

        when(authentication.getPrincipal()).thenReturn(userDetails);

        when(jwtUtils.generateJwtToken(
                eq("usuario@test.com"),
                any()
        )).thenReturn("jwt-de-prueba");

        JwtResponse resultado = authService.login(request);

        assertNotNull(resultado);

        verify(authenticationManager).authenticate(any(
                UsernamePasswordAuthenticationToken.class
        ));

        verify(jwtUtils).generateJwtToken(
                eq("usuario@test.com"),
                any()
        );
    }

    @Test
    void loginConCredencialesIncorrectasDebeLanzarExcepcion() {
        LoginRequest request = new LoginRequest();
        request.setEmail("usuario@test.com");
        request.setPassword("incorrecta");

        when(authenticationManager.authenticate(any(
                UsernamePasswordAuthenticationToken.class
        ))).thenThrow(new BadCredentialsException("Credenciales incorrectas"));

        assertThrows(
                BadCredentialsException.class,
                () -> authService.login(request)
        );

        verify(jwtUtils, never()).generateJwtToken(anyString(), any());
    }

    @Test
    void registrarUsuarioDebeEncriptarLaContrasenaYGuardar() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Agustin");
        request.setLastName("Perez");
        request.setEmail("nuevo@test.com");
        request.setPassword("clave123");

        Role rolUsuario = new Role();

        when(userRepository.existsByEmail("nuevo@test.com"))
                .thenReturn(false);

        when(roleRepository.findByNameRole(ERole.ROLE_USER))
                .thenReturn(Optional.of(rolUsuario));

        when(passwordEncoder.encode("clave123"))
                .thenReturn("hash-de-prueba");

        authService.register(request);

        verify(passwordEncoder).encode("clave123");

        verify(userRepository).save(argThat(usuario ->
                usuario.getEmail().equals("nuevo@test.com")
                        && usuario.getPassword().equals("hash-de-prueba")
                        && usuario.getName().equals("Agustin")
                        && usuario.getLastName().equals("Perez")
        ));
    }

    @Test
    void registrarEmailExistenteDebeLanzarExcepcion() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("existente@test.com");
        request.setPassword("clave123");

        when(userRepository.existsByEmail("existente@test.com"))
                .thenReturn(true);

        assertThrows(
                IllegalArgumentException.class,
                () -> authService.register(request)
        );

        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(anyString());
    }
}