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
        progreso.setPeso((Double) map.get("peso"));
        progreso.setMasaGrasa((Double) map.get("masaGrasa"));
        progreso.setMasaMuscular((Double) map.get("masaMuscular"));
        progreso.setPecho((Double) map.get("pecho"));
        progreso.setAbdomen((Double) map.get("abdomen"));
        progreso.setCadera((Double) map.get("cadera"));
        progreso.setCintura((Double) map.get("cintura"));
        progreso.setBrazoDerecho((Double) map.get("brazoDerecho"));
        progreso.setPiernaDerecha((Double) map.get("piernaDerecha"));
        return progreso;
    }
}//Cierre de la clase Progreso
