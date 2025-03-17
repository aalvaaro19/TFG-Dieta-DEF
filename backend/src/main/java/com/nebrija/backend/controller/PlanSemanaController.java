package com.nebrija.backend.controller;

import com.nebrija.backend.model.PlanSemana;
import com.nebrija.backend.service.PlanSemanaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.ExecutionException;

@Slf4j
@RestController
@RequestMapping("/api/planes-semana")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:4200")
public class PlanSemanaController {

    @Autowired
    private PlanSemanaService planSemanaService;

    @GetMapping("/admin/planes-semana/getAllPlanes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PlanSemana>> getAllPlanes() {
        try {
            List<PlanSemana> planes = planSemanaService.getAllPlanesSemana();
            return ResponseEntity.ok(planes);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener los planes de la semana: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/admin/planes-semana/getPlan/{id_plan}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlanSemana> getPlan(@PathVariable String id_plan) {
        try {
            PlanSemana plan = planSemanaService.getPlanSemanaById(id_plan);
            if (plan != null) {
                return ResponseEntity.ok(plan);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener el plan de la semana: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/admin/planes-semana/savePlan")
    @PreAuthorize("hasRole('ADMIN')")
    public void savePlan(@RequestBody PlanSemana planSemana) {
        planSemanaService.createPlanSemana(planSemana);
    }

    @PutMapping("/admin/planes-semana/updatePlan")
    @PreAuthorize("hasRole('ADMIN')")
    public void updatePlan(@RequestBody PlanSemana planSemana) {
        planSemanaService.updatePlanSemana(planSemana);
    }

    @DeleteMapping("/admin/planes-semana/deletePlan/{id_plan}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deletePlan(@PathVariable String id_plan) {
        planSemanaService.deletePlanSemana(id_plan);
    }

    @DeleteMapping("/admin/planes-semana/deleteAllPlanes")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAllPlanes() {
        planSemanaService.deleteAllPlanesSemana();
    }
}
