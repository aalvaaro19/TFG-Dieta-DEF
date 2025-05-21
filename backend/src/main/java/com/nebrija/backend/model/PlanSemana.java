package com.nebrija.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanSemana {
    private String id_PlanSemana;
    private String id_usuario;
    private List<String> diasSemana;
    private String fechaInicio;
    private String fechaFin;
    private String estadoPlan;

    public Map<String, Object> toMapPlanSemana() {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id_PlanSemana", id_PlanSemana);
        map.put("id_usuario", id_usuario);
        map.put("diasSemana", diasSemana);
        map.put("fechaInicio", fechaInicio);
        map.put("fechaFin", fechaFin);
        map.put("estadoPlan", estadoPlan);
        return map;
    }

    public static PlanSemana fromMap(Map<String, Object> map) {
        PlanSemana planSemana = new PlanSemana();
        planSemana.setId_PlanSemana((String) map.get("id_PlanSemana"));
        planSemana.setId_usuario((String) map.get("id_usuario"));
        planSemana.setDiasSemana((List<String>) map.get("diasSemana"));
        planSemana.setFechaInicio((String) map.get("fechaInicio"));
        planSemana.setFechaFin((String) map.get("fechaFin"));
        planSemana.setEstadoPlan((String) map.get("estadoPlan"));
        return planSemana;
    }
}
