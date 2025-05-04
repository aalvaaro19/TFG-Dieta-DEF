package com.nebrija.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Receta {
    private String id_receta;
    private String nombre;
    private String descripcion;
    private List<String> ingredientes;
    private List<String> cantidades;
    private String calorias;
    private String cantidad_carbohidratos;
    private String cantidad_proteinas;
    private String cantidad_grasas;
    private String tiempo_preparacion;
    private String dificultad;
    private String imagen;

    public Map<String, Object> toMapReceta() {
        Map<String, Object> map = new HashMap<>();
        map.put("id_receta", id_receta);
        map.put("nombre", nombre);
        map.put("descripcion", descripcion);
        map.put("ingredientes", ingredientes);
        map.put("cantidades", cantidades);
        map.put("calorias", calorias);
        map.put("cantidad_carbohidratos", cantidad_carbohidratos);
        map.put("cantidad_proteinas", cantidad_proteinas);
        map.put("cantidad_grasas", cantidad_grasas);
        map.put("tiempo_preparacion", tiempo_preparacion);
        map.put("dificultad", dificultad);
        map.put("imagen", imagen);
        return map;
    }

    public static Receta fromMap(Map<String, Object> map) {
        Receta receta = new Receta();
        receta.setId_receta((String) map.get("id_receta"));
        receta.setNombre((String) map.get("nombre"));
        receta.setDescripcion((String) map.get("descripcion"));
        receta.setIngredientes((List<String>) map.get("ingredientes"));
        receta.setCantidades((List<String>) map.get("cantidades"));
        receta.setCalorias((String) map.get("calorias"));
        receta.setCantidad_carbohidratos((String) map.get("cantidad_carbohidratos"));
        receta.setCantidad_proteinas((String) map.get("cantidad_proteinas"));
        receta.setCantidad_grasas((String) map.get("cantidad_grasas"));
        receta.setTiempo_preparacion((String) map.get("tiempo_preparacion"));
        receta.setDificultad((String) map.get("dificultad"));
        receta.setImagen((String) map.get("imagen"));
        return receta;
    }
}
