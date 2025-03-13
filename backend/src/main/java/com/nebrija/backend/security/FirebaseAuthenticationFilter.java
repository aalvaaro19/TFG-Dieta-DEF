package com.nebrija.backend.security;

import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.nebrija.backend.model.User;
import com.nebrija.backend.model.enums.Role;
import com.nebrija.backend.service.FirebaseService;
import com.nebrija.backend.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class FirebaseAuthenticationFilter extends OncePerRequestFilter {

    private final FirebaseService firebaseService;
    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Skip authentication for OPTIONS requests (CORS preflight)
        if (request.getMethod().equals("OPTIONS")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check public endpoints that don't need authentication
        String requestURI = request.getRequestURI();
        if (isPublicEndpoint(requestURI)) {
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // No authentication header - let Spring Security handle it
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        System.out.println("Processing token: " + token.substring(0, 10) + "...");

        try {
            // Verify token with Firebase Auth
            FirebaseToken decodedToken = firebaseService.verifyToken(token);
            if (decodedToken != null) {
                // Find user in Realtime Database
                User user = userService.findUserByUid(decodedToken.getUid());

                // If user doesn't exist in DB, create it
                if (user == null) {
                    String email = decodedToken.getEmail();
                    String password = "defaultPassword";
                    String nombreUsuario = decodedToken.getName() != null ? decodedToken.getName() : email;
                    String nombreCompleto = decodedToken.getName() != null ? decodedToken.getName() : email;
                    String telefono = "";
                    String direccion = "";
                    double peso = 0.0;
                    double altura = 0.0;
                    String sexo = "";
                    int edad = 0;
                    String objetivo = "";
                    String imagen = "";

                    userService.createUser(email, password, nombreUsuario, nombreCompleto, telefono, direccion, peso, altura, sexo, edad, objetivo, imagen);

                    user = userService.findUserByUid(decodedToken.getUid());

                    if (user == null) {
                        throw new IllegalStateException("Unable to create or retrieve user");
                    }
                }

                // Get role from the user object - ensure role is not null
                Role userRole;
                if (user.getRol() != null) {
                    userRole = user.getRol();
                } else {
                    userRole = Role.USER;
                    userService.updateUserRole(user.getId_usuario(), userRole); // Asigna el rol en BD si no lo tiene
                }

                // Debug log to check the role
                System.out.println("User authenticated: " + user.getNombreUsuario());
                System.out.println("User role: " + userRole);

                // Set up authorities based on role
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                        new SimpleGrantedAuthority("ROLE_" + userRole.name())
                );

                // Create authentication token and set in security context
                FirebaseAuthenticationToken authentication =
                        new FirebaseAuthenticationToken(user, token, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (FirebaseAuthException e) {
            SecurityContextHolder.clearContext();

            // Log the specific error
            System.err.println("Firebase Auth Error: " + e.getMessage());

            // If it's a token expired error, respond with a specific error code
            if (e.getMessage().contains("expired")) {
                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"token_expired\",\"message\":\"Firebase ID token has expired\"}");
                return;
            }

            // Continue with the filter chain for other error types
        } catch (Exception e) {
            System.err.println("Authentication error: " + e.getMessage());
            e.printStackTrace();
            SecurityContextHolder.clearContext();
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("⚠️ No authentication in SecurityContext");
        } else {
            System.out.println("✅ User authenticated: " + SecurityContextHolder.getContext().getAuthentication().getName());
            System.out.println("🔹 Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicEndpoint(String uri) {
        return uri.startsWith("/api/auth/") ||
                uri.startsWith("/api/public/") ||
                uri.equals("/api/users/createUser") ||
                uri.equals("/api/users/comprobarRol");
    }
}