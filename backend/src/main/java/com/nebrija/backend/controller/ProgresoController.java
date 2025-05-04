package com.nebrija.backend.controller;

import com.nebrija.backend.model.Progreso;
import com.nebrija.backend.service.ProgresoService;
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
@RequestMapping("/api/progresos")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:4200")
public class ProgresoController {

    @Autowired
    private ProgresoService progresoService;

    // Endpoints para usuarios (USER y ADMIN)

    @GetMapping("/progresoUsuario/{userId}")
    public ResponseEntity<List<Progreso>> getUserProgresos(@PathVariable String userId) {
        try {
            List<Progreso> progresos = progresoService.getProgresosByUserId(userId);
            return ResponseEntity.ok(progresos);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener los progresos del usuario: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/progreso/{id_progreso}")
    public ResponseEntity<Progreso> getProgreso(@PathVariable String id_progreso) {
        try {
            Progreso progreso = progresoService.getProgresoById(id_progreso);
            if (progreso != null) {
                return ResponseEntity.ok(progreso);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener el progreso: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/guardarProgreso")
    public ResponseEntity<Void> saveProgreso(@RequestBody Progreso progreso) {
        try {
            if (progreso.getId_progreso() == null || progreso.getId_progreso().isEmpty()) {
                System.out.println("ID de progreso no proporcionado, se generará uno nuevo");
            }
            progresoService.createProgreso(progreso);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Error al guardar el progreso: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/actualizarProgreso")
    public ResponseEntity<Void> updateProgreso(@RequestBody Progreso progreso) {
        try {
            progresoService.updateProgreso(progreso);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error al actualizar el progreso: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/eliminarProgreso/{id_progreso}")
    public ResponseEntity<Void> deleteProgreso(@PathVariable String id_progreso) {
        try {
            progresoService.deleteProgreso(id_progreso);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error al eliminar el progreso: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoints solo para administradores

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Progreso>> getAllProgresos() {
        try {
            List<Progreso> progresos = progresoService.getAllProgresos();
            return ResponseEntity.ok(progresos);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener todos los progresos: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/admin/deleteAll")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAllProgresos() {
        try {
            progresoService.deleteAllProgresos();
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error al eliminar todos los progresos: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}