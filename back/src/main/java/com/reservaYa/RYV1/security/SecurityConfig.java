package com.reservaYa.RYV1.security;

import com.reservaYa.RYV1.security.jwt.AuthTokenFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final AuthTokenFilter authTokenFilter;

    public SecurityConfig(AuthTokenFilter authTokenFilter) {
        this.authTokenFilter = authTokenFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        config.setAllowedMethods(
                List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
        );

        config.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "Accept", "Origin")
        );

        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                HttpMethod.OPTIONS, "/**"
                        ).permitAll()

                        .requestMatchers(
                                "/auth/login",
                                "/auth/register"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/productos",
                                "/api/productos/**"
                        ).permitAll()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/categorias",
                                "/api/categorias/**"
                        ).permitAll()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/productos",
                                "/api/productos/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/productos/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/api/productos/**"
                        ).hasRole("ADMIN")

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/productos",
                                "/api/productos/**"
                        ).hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(
                        authTokenFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}
