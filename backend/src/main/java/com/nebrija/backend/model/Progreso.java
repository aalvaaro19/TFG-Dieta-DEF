package com.nebrija.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Progreso {
    private String id_progreso;
    private String id_usuario;
    private String fecha;
    private double peso;
    private double masaGrasa;
    private double masaMuscular;
    private double pecho;
    private double abdomen;
    private double cadera;
    private double cintura;
    private double brazoDerecho;
    private double piernaDerecha;

    public Map<String, Object> toMap(){
        Map<String, Object> map = new HashMap<>();
        map.put("id_progreso", id_progreso);
        map.put("id_usuario", id_usuario);
        map.put("fecha", fecha);
        map.put("peso", peso);
        map.put("masaGrasa", masaGrasa);
        map.put("masaMuscular", masaMuscular);
        map.put("pecho", pecho);
        map.put("abdomen", abdomen);
        map.put("cadera", cadera);
        map.put("cintura", cintura);
        map.put("brazoDerecho", brazoDerecho);
        map.put("piernaDerecha", piernaDerecha);
        return map;
    }

    public static Progreso fromMap(Map<String, Object> map) {
        Progreso progreso = new Progreso();
        progreso.setId_progreso((String) map.get("id_progreso"));
        progreso.setId_usuario((String) map.get("id_usuario"));
        progreso.setFecha((String) map.get("fecha"));
        progreso.setPeso(toDouble(map.get("peso")));
        progreso.setMasaGrasa(toDouble(map.get("masaGrasa")));
        progreso.setMasaMuscular(toDouble(map.get("masaMuscular")));
        progreso.setPecho(toDouble(map.get("pecho")));
        progreso.setAbdomen(toDouble(map.get("abdomen")));
        progreso.setCadera(toDouble(map.get("cadera")));
        progreso.setCintura(toDouble(map.get("cintura")));
        progreso.setBrazoDerecho(toDouble(map.get("brazoDerecho")));
        progreso.setPiernaDerecha(toDouble(map.get("piernaDerecha")));
        return progreso;
    }

    private static double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Double) return (Double) value;
        if (value instanceof Integer) return ((Integer) value).doubleValue();
        if (value instanceof Long) return ((Long) value).doubleValue();
        if (value instanceof Float) return ((Float) value).doubleValue();
        if (value instanceof String) {
            try { return Double.parseDouble((String) value); } catch (Exception e) { return 0.0; }
        }
        return 0.0;
    }
}//Cierre de la clase Progreso
