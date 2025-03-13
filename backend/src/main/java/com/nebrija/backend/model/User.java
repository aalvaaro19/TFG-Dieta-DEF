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
    private int edad;
    private String objetivo;
    private String imagen;
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
        map.put("edad", edad);
        map.put("objetivo", objetivo);
        map.put("imagen", imagen);
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

        if (map.get("edad") instanceof Integer) {
            user.setEdad((Integer) map.get("edad"));
        } else if (map.get("edad") instanceof Long) {
            user.setEdad(((Long) map.get("edad")).intValue());
        }

        user.setObjetivo((String) map.get("objetivo"));
        user.setImagen((String) map.get("imagen"));

        try {
            if (map.get("rol") != null) {
                user.setRol(Role.valueOf(map.get("rol").toString()));
            } else {
                user.setRol(Role.USER);
            }
        } catch (IllegalArgumentException e) {
            user.setRol(Role.USER);
        }

        return user;
    }
}//Cierre de la clase User