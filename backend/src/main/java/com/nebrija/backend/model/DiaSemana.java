package com.nebrija.backend.model;

import com.nebrija.backend.model.enums.DiasSemana;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
        map.put("dia_semana", dia_semana);
        map.put("receta", receta);
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
        diaSemana.setDia_semana((DiasSemana) map.get("dia_semana"));
        diaSemana.setReceta((List<Receta>) map.get("receta"));
        diaSemana.setObjetivoCaloriasDelDia((Integer) map.get("objetivoCaloriasDelDia"));
        diaSemana.setObjetivoProteinasDelDia((Integer) map.get("objetivoProteinasDelDia"));
        diaSemana.setObjetivoCarbohidratosDelDia((Integer) map.get("objetivoCarbohidratosDelDia"));
        diaSemana.setObjetivoGrasasDelDia((Integer) map.get("objetivoGrasasDelDia"));
        diaSemana.setNumeroComidasDia((Integer) map.get("numeroComidasDia"));
        diaSemana.setRecomendacionesDelDia((String) map.get("recomendacionesDelDia"));
        diaSemana.setFechaDia((String) map.get("fechaDia"));
        diaSemana.setEstadoDia((String) map.get("estadoDia"));
        return diaSemana;
    }

}
