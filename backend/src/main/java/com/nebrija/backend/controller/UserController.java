package com.nebrija.backend.controller;

import com.nebrija.backend.model.enums.Role;
import com.nebrija.backend.model.User;
import com.nebrija.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:4200")
public class UserController {

    @Autowired
    private final UserService userService;

    // Endpoint para usuarios (USER y ADMIN)
    @GetMapping("/users/profile/{uid}")
    public ResponseEntity<User> getUserProfile(@PathVariable String uid) {
        try {
            User user = userService.findUserByUid(uid);
            if (user != null) {
                return ResponseEntity.ok(user);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/users/createUser")
    public void createUser(@RequestBody User user) {
        System.out.println("Usuario recibido: " + user);
        userService.createUser(user.getEmail(), user.getPassword(), user.getNombreUsuario(),
                user.getNombreCompleto(), user.getTelefono(), user.getDireccion(),
                user.getPeso(), user.getAltura(), user.getSexo(), user.getEdad(), user.getObjetivo(), user.getImagen());
    }

    @PutMapping("/users/update/{uid}")
    public void updateUser(@PathVariable String uid,
                           @RequestParam String nombreUsuario,
                           @RequestParam String nombreCompleto,
                           @RequestParam String telefono,
                           @RequestParam String direccion,
                           @RequestParam String email,
                           @RequestParam String password,
                           @RequestParam double peso,
                           @RequestParam double altura,
                           @RequestParam String sexo,
                           @RequestParam int edad,
                           @RequestParam String objetivo,
                           @RequestParam String imagen) {
        userService.updateUser(uid, nombreUsuario, nombreCompleto, telefono, direccion, email, password, peso, altura, sexo, edad, objetivo, imagen);
    }

    @DeleteMapping("/users/delete/{uid}")
    public ResponseEntity<?> deleteUser(@PathVariable String uid, HttpServletRequest request) {
        try {
            // Obtener el token del header Authorization
            String authHeader = request.getHeader("Authorization");

            // Validar que el header exista y tenga el formato correcto
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Token de autorización requerido"));
            }

            // Extraer el token sin el prefijo "Bearer "
            String token = authHeader.substring(7);

            // Log para debug (opcional)
            System.out.println("🔍 Eliminando usuario con UID: " + uid);
            System.out.println("🔍 Token recibido: " + token.substring(0, Math.min(20, token.length())) + "...");

            // Llamar al servicio para eliminar el usuario
            userService.deleteUser(uid, token);

            // Respuesta exitosa
            return ResponseEntity.ok(Map.of(
                    "message", "Usuario eliminado exitosamente",
                    "uid", uid
            ));

        } catch (IllegalArgumentException e) {
            // Error de validación (ej: usuario no encontrado, no se puede eliminar a sí mismo)
            System.err.println("❌ Error de validación: " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (SecurityException e) {
            // Error de permisos
            System.err.println("❌ Error de permisos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "No tienes permisos para realizar esta acción"));

        } catch (Exception e) {
            // Error general
            System.err.println("❌ Error al eliminar usuario: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error interno del servidor: " + e.getMessage()));
        }
    }

    // Endpoints solo para administradores
    @GetMapping("/admin/users/getAllUsers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (ExecutionException | InterruptedException e) {
            log.error(String.valueOf(e));
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/admin/users/getUserById")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@RequestParam String uid) {
        try {
            User user = userService.getUserById(uid);
            return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
        } catch (ExecutionException | InterruptedException e) {
            log.error(String.valueOf(e));
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/admin/users/{uid}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateUserRole(@PathVariable String uid, @RequestBody Map<String, String> payload) {
        try {
            String roleStr = payload.get("role");
            Role role = Role.valueOf(roleStr);
            userService.updateUserRole(uid, role);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/users/comprobarRol")
    public ResponseEntity<Map<String, Role>> verifyUserRole(@RequestHeader("Authorization") String token) {
        try {
            // Extraer el token sin "Bearer "
            String idToken = token.replace("Bearer ", "");
            System.out.println("Token recibido: " + idToken);

            // Verificar el rol del usuario
            Role role = userService.verifyUserRole(idToken);
            System.out.println("Rol del usuario: " + role);

            return ResponseEntity.ok(Collections.singletonMap("role", role));
        } catch (Exception e) {
            e.printStackTrace(); // Mostrar el error completo
            return ResponseEntity.status(401).build();
        }
    }
}
