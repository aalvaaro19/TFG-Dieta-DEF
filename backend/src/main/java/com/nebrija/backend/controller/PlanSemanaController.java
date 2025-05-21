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

    // Endpoint para obtener todos los planes (requiere rol ADMIN)
    @GetMapping("/admin/getAllPlanes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PlanSemana>> getAllPlanes() {
        try {
            List<PlanSemana> planes = planSemanaService.getAllPlanesSemana();
            return ResponseEntity.ok(planes);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener todos los planes de la semana: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint para obtener un plan específico por ID (requiere rol ADMIN)
    @GetMapping("/admin/getPlan/{id_plan}")
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

    // Endpoint para crear un nuevo plan (requiere rol ADMIN)
    @PostMapping("/admin/savePlan")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> savePlan(@RequestBody PlanSemana planSemana) {
        try {
            planSemanaService.createPlanSemana(planSemana);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error al guardar el plan de la semana: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint para actualizar un plan existente (requiere rol ADMIN)
    @PutMapping("/admin/updatePlan")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updatePlan(@RequestBody PlanSemana planSemana) {
        try {
            planSemanaService.updatePlanSemana(planSemana);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error al actualizar el plan de la semana: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint para eliminar un plan específico (requiere rol ADMIN)
    @DeleteMapping("/admin/deletePlan/{id_plan}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePlan(@PathVariable String id_plan) {
        try {
            planSemanaService.deletePlanSemana(id_plan);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error al eliminar el plan de la semana: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint para eliminar todos los planes (requiere rol ADMIN)
    @DeleteMapping("/admin/deleteAllPlanes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAllPlanes() {
        try {
            planSemanaService.deleteAllPlanesSemana();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error al eliminar todos los planes de la semana: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint para obtener los planes de un usuario específico (accesible para usuarios autenticados)
    @GetMapping("/users/getMisPlanes/{id_usuario}")
    public ResponseEntity<List<PlanSemana>> getPlanesUsuario(@PathVariable String id_usuario) {
        try {
            List<PlanSemana> planes = planSemanaService.getPlanesUsuario(id_usuario);
            return ResponseEntity.ok(planes);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener los planes del usuario: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}