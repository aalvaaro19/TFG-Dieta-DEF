package com.nebrija.backend.controller;

import com.nebrija.backend.model.enums.Role;
import com.nebrija.backend.model.User;
import com.nebrija.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
        userService.createUser(user.getEmail(), user.getPassword(), user.getNombreUsuario(),
                user.getNombreCompleto(), user.getTelefono(), user.getDireccion(),
                user.getPeso(), user.getAltura(), user.getSexo());
    }

    @PutMapping("/users/update/{uid}")
    public void updateUser(@PathVariable String uid,
                           @RequestParam String nombreUsuario,
                           @RequestParam String nombreCompleto,
                           @RequestParam String telefono,
                           @RequestParam String direccion,
                           @RequestParam double peso,
                           @RequestParam double altura,
                           @RequestParam String sexo) {
        userService.updateUser(uid, nombreUsuario, nombreCompleto, telefono, direccion, peso, altura, sexo);
    }

    @DeleteMapping("/users/delete/{uid}")
    public void deleteUser(@PathVariable String uid) {
        userService.deleteUser(uid); // Llama al servicio para eliminar el usuario
    }

    @DeleteMapping("/users/deleteUser/{uid}")
    public ResponseEntity<Void> deleteUsersss(@PathVariable String uid) {
        try {
            userService.deleteUser(uid);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
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


    @DeleteMapping("/admin/users/{uid}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUsers(@PathVariable String uid) {
        try {
            userService.deleteUser(uid);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users/comprobarRol")
    public ResponseEntity<Role> verifyUserRole(@RequestHeader("Authorization") String token) {
        try {
            // Extraer el token sin "Bearer "
            String idToken = token.replace("Bearer ", "");
            System.out.println("Token recibido: " + idToken);

            // Verificar el rol del usuario
            Role role = userService.verifyUserRole(idToken);
            System.out.println("Rol del usuario: " + role);

            return ResponseEntity.ok(role);
        } catch (Exception e) {
            e.printStackTrace(); // Mostrar el error completo
            return ResponseEntity.status(401).build();
        }
    }
}
