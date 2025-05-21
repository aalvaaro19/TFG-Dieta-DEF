package com.nebrija.backend.model;

import com.nebrija.backend.model.enums.DiasSemana;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaSemana {
    private String id_diaSemana;
    private DiasSemana dia_semana;
    private List<Receta> receta;
    private int objetivoCaloriasDelDia;
    private int objetivoProteinasDelDia;
    private int objetivoCarbohidratosDelDia;
    private int objetivoGrasasDelDia;
    private int numeroComidasDia;
    private String recomendacionesDelDia;
    private String fechaDia;
    private String estadoDia;

    // Metodo para convertir a un Map
    public Map<String, Object> toMapRecetaReceta() {
        Map<String, Object> map = new HashMap<>();
        map.put("id_diaSemana", id_diaSemana);

        // Convertir el enum a string para guardar en Firebase
        if (dia_semana != null) {
            map.put("dia_semana", dia_semana.name());
        } else {
            map.put("dia_semana", DiasSemana.LUNES.name());
        }

        // Si receta es null, inicializar como lista vacía
        map.put("receta", receta != null ? receta : new ArrayList<>());
        map.put("objetivoCaloriasDelDia", objetivoCaloriasDelDia);
        map.put("objetivoProteinasDelDia", objetivoProteinasDelDia);
        map.put("objetivoCarbohidratosDelDia", objetivoCarbohidratosDelDia);
        map.put("objetivoGrasasDelDia", objetivoGrasasDelDia);
        map.put("numeroComidasDia", numeroComidasDia);
        map.put("recomendacionesDelDia", recomendacionesDelDia);
        map.put("fechaDia", fechaDia);
        map.put("estadoDia", estadoDia);
        return map;
    }

    // Metodo para convertir de un Map a un objeto de DiaSemana
    public static DiaSemana fromMap(Map<String, Object> map) {
        DiaSemana diaSemana = new DiaSemana();
        diaSemana.setId_diaSemana((String) map.get("id_diaSemana"));

        // Convertir correctamente el String a enum DiasSemana
        Object diaValue = map.get("dia_semana");
        if (diaValue instanceof String) {
            try {
                diaSemana.setDia_semana(DiasSemana.valueOf((String) diaValue));
            } catch (IllegalArgumentException e) {
                System.err.println("Error al convertir día: " + diaValue + " - " + e.getMessage());
                // Establecer un valor por defecto
                diaSemana.setDia_semana(DiasSemana.LUNES);
            }
        } else if (diaValue instanceof DiasSemana) {
            diaSemana.setDia_semana((DiasSemana) diaValue);
        } else {
            System.err.println("Tipo de dato inesperado para dia_semana: " +
                    (diaValue != null ? diaValue.getClass().getName() : "null"));
            // Establecer un valor por defecto
            diaSemana.setDia_semana(DiasSemana.LUNES);
        }

        diaSemana.setReceta((List<Receta>) map.get("receta"));

        // Manejar tipos numéricos con seguridad
        Object objetivoCaloriasObj = map.get("objetivoCaloriasDelDia");
        if (objetivoCaloriasObj instanceof Long) {
            diaSemana.setObjetivoCaloriasDelDia(((Long) objetivoCaloriasObj).intValue());
        } else if (objetivoCaloriasObj instanceof Integer) {
            diaSemana.setObjetivoCaloriasDelDia((Integer) objetivoCaloriasObj);
        } else if (objetivoCaloriasObj instanceof Double) {
            diaSemana.setObjetivoCaloriasDelDia(((Double) objetivoCaloriasObj).intValue());
        } else {
            diaSemana.setObjetivoCaloriasDelDia(0);
        }

        // Realizar conversiones similares para otros campos numéricos
        Object objetivoProteinasObj = map.get("objetivoProteinasDelDia");
        if (objetivoProteinasObj instanceof Long) {
            diaSemana.setObjetivoProteinasDelDia(((Long) objetivoProteinasObj).intValue());
        } else if (objetivoProteinasObj instanceof Integer) {
            diaSemana.setObjetivoProteinasDelDia((Integer) objetivoProteinasObj);
        } else if (objetivoProteinasObj instanceof Double) {
            diaSemana.setObjetivoProteinasDelDia(((Double) objetivoProteinasObj).intValue());
        } else {
            diaSemana.setObjetivoProteinasDelDia(0);
        }

        Object objetivoCarbosObj = map.get("objetivoCarbohidratosDelDia");
        if (objetivoCarbosObj instanceof Long) {
            diaSemana.setObjetivoCarbohidratosDelDia(((Long) objetivoCarbosObj).intValue());
        } else if (objetivoCarbosObj instanceof Integer) {
            diaSemana.setObjetivoCarbohidratosDelDia((Integer) objetivoCarbosObj);
        } else if (objetivoCarbosObj instanceof Double) {
            diaSemana.setObjetivoCarbohidratosDelDia(((Double) objetivoCarbosObj).intValue());
        } else {
            diaSemana.setObjetivoCarbohidratosDelDia(0);
        }

        Object objetivoGrasasObj = map.get("objetivoGrasasDelDia");
        if (objetivoGrasasObj instanceof Long) {
            diaSemana.setObjetivoGrasasDelDia(((Long) objetivoGrasasObj).intValue());
        } else if (objetivoGrasasObj instanceof Integer) {
            diaSemana.setObjetivoGrasasDelDia((Integer) objetivoGrasasObj);
        } else if (objetivoGrasasObj instanceof Double) {
            diaSemana.setObjetivoGrasasDelDia(((Double) objetivoGrasasObj).intValue());
        } else {
            diaSemana.setObjetivoGrasasDelDia(0);
        }

        Object numComidasObj = map.get("numeroComidasDia");
        if (numComidasObj instanceof Long) {
            diaSemana.setNumeroComidasDia(((Long) numComidasObj).intValue());
        } else if (numComidasObj instanceof Integer) {
            diaSemana.setNumeroComidasDia((Integer) numComidasObj);
        } else if (numComidasObj instanceof Double) {
            diaSemana.setNumeroComidasDia(((Double) numComidasObj).intValue());
        } else {
            diaSemana.setNumeroComidasDia(3); // Valor por defecto
        }

        diaSemana.setRecomendacionesDelDia((String) map.get("recomendacionesDelDia"));
        diaSemana.setFechaDia((String) map.get("fechaDia"));
        diaSemana.setEstadoDia((String) map.get("estadoDia"));

        return diaSemana;
    }

}
