package com.nebrija.backend.model;

import com.nebrija.backend.model.enums.DiasSemana;
import com.nebrija.backend.model.enums.TipoComida;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanSemana {
    private String id_planSemana;
    private String id_usuario;
    private List<DiaSemana> dias;
    private String fecha_inicio;
    private String fecha_fin;
    private String objetivoCalorias;
    private String objetivoProteinas;
    private String objetivoCarbohidratos;
    private String objetivoGrasas;
    private String tipoDieta;
    private List<String> restriccionesAlimenticias;
    private List<Receta> recetas;
    private String numeroComidasDiarias;
    private String pesoObjetivo;
    private String fechaObjetivo;
    private String estadoPlan;
    private String comentarios;

    public Map<String, Object> toMapRecetaReceta() {
        Map<String, Object> map = new HashMap<>();
        map.put("id_planSemana", id_planSemana);
        map.put("id_usuario", id_usuario);
        map.put("dias", dias);
        map.put("fecha_inicio", fecha_inicio);
        map.put("fecha_fin", fecha_fin);
        map.put("objetivoCalorias", objetivoCalorias);
        map.put("objetivoProteinas", objetivoProteinas);
        map.put("objetivoCarbohidratos", objetivoCarbohidratos);
        map.put("objetivoGrasas", objetivoGrasas);
        map.put("tipoDieta", tipoDieta);
        map.put("restriccionesAlimenticias", restriccionesAlimenticias);
        map.put("recetas", recetas);
        map.put("numeroComidasDiarias", numeroComidasDiarias);
        map.put("pesoObjetivo", pesoObjetivo);
        map.put("fechaObjetivo", fechaObjetivo);
        map.put("estadoPlan", estadoPlan);
        map.put("comentarios", comentarios);
        return map;
    }

    public static PlanSemana fromMap(Map<String, Object> map) {
        PlanSemana planSemana = new PlanSemana();
        planSemana.setId_planSemana((String) map.get("id_planSemana"));
        planSemana.setId_usuario((String) map.get("id_usuario"));
        planSemana.setDias((List<DiaSemana>) map.get("dias"));
        planSemana.setFecha_inicio((String) map.get("fecha_inicio"));
        planSemana.setFecha_fin((String) map.get("fecha_fin"));
        planSemana.setObjetivoCalorias((String) map.get("objetivoCalorias"));
        planSemana.setObjetivoProteinas((String) map.get("objetivoProteinas"));
        planSemana.setObjetivoCarbohidratos((String) map.get("objetivoCarbohidratos"));
        planSemana.setObjetivoGrasas((String) map.get("objetivoGrasas"));
        planSemana.setTipoDieta((String) map.get("tipoDieta"));
        planSemana.setRestriccionesAlimenticias((List<String>) map.get("restriccionesAlimenticias"));
        planSemana.setRecetas((List<Receta>) map.get("recetas"));
        planSemana.setNumeroComidasDiarias((String) map.get("numeroComidasDiarias"));
        planSemana.setPesoObjetivo((String) map.get("pesoObjetivo"));
        planSemana.setFechaObjetivo((String) map.get("fechaObjetivo"));
        planSemana.setEstadoPlan((String) map.get("estadoPlan"));
        planSemana.setComentarios((String) map.get("comentarios"));
        return planSemana;
    }
}
