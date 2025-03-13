package com.nebrija.backend.model;


import com.nebrija.backend.model.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private String id_usuario;
    private String nombreUsuario;
    private String nombreCompleto;
    private String telefono;
    private String direccion;
    private String email;
    private String password;
    private double peso;
    private double altura;
    private String sexo;
    private Role rol = Role.USER;

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id_usuario", id_usuario);
        map.put("nombreUsuario", nombreUsuario);
        map.put("nombreCompleto", nombreCompleto);
        map.put("telefono", telefono);
        map.put("direccion", direccion);
        map.put("email", email);
        map.put("password", password);
        map.put("peso", peso);
        map.put("altura", altura);
        map.put("sexo", sexo);
        map.put("rol", rol != null ? rol.name() : Role.USER.name());
        return map;
    }

    public static User fromMap(Map<String, Object> map) {
        User user = new User();
        user.setId_usuario((String) map.get("id_usuario"));
        user.setNombreUsuario((String) map.get("nombreUsuario"));
        user.setNombreCompleto((String) map.get("nombreCompleto"));
        user.setTelefono((String) map.get("telefono"));
        user.setDireccion((String) map.get("direccion"));
        user.setEmail((String) map.get("email"));
        user.setPassword((String) map.get("password"));

        // Handle numeric values that might be stored as different types in Firebase
        if (map.get("peso") instanceof Double) {
            user.setPeso((Double) map.get("peso"));
        } else if (map.get("peso") instanceof Long) {
            user.setPeso(((Long) map.get("peso")).doubleValue());
        }

        if (map.get("altura") instanceof Double) {
            user.setAltura((Double) map.get("altura"));
        } else if (map.get("altura") instanceof Long) {
            user.setAltura(((Long) map.get("altura")).doubleValue());
        }

        user.setSexo((String) map.get("sexo"));

        // Set role - handle both string and enum cases
        try {
            if (map.get("rol") != null) {
                String roleStr = map.get("rol").toString();
                user.setRol(Role.valueOf(roleStr));
            } else {
                user.setRol(Role.USER); // Default role
            }
        } catch (IllegalArgumentException e) {
            // Default to USER if role parsing fails
            user.setRol(Role.USER);
        }

        return user;
    }

    public Role getRol() {
        return rol != null ? rol : Role.USER;
    }
}// End of class User