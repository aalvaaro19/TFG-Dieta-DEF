package com.nebrija.backend.controller;

import com.nebrija.backend.model.Receta;
import com.nebrija.backend.service.RecetaService;
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
@RequestMapping("/api/recetas")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:4200")
public class RecetaController {

    @Autowired
    private RecetaService recetaService;

    @GetMapping("/admin/recetas/getAllRecetas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Receta>> getAllRecetas() {
        try {
            List<Receta> recetas = recetaService.getDataRecetas("recetas");
            return ResponseEntity.ok(recetas);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener todas las recetas: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/admin/recetas/getReceta/{id_receta}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Receta> getReceta(@PathVariable String id_receta) {
        try {
            Receta receta = recetaService.getRecetaById(id_receta);
            if (receta != null) {
                return ResponseEntity.ok(receta);
            }
            return ResponseEntity.notFound().build();
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener receta con id {}: {}", id_receta, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/admin/recetas/saveReceta")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> saveReceta(@RequestBody Receta receta) {
        try {
            boolean result = recetaService.createReceta(
                    receta.getNombre(),
                    receta.getDescripcion(),
                    receta.getIngredientes(),
                    receta.getCantidades(),
                    receta.getCalorias(),
                    receta.getCantidad_carbohidratos(),
                    receta.getCantidad_proteinas(),
                    receta.getCantidad_grasas(),
                    receta.getTiempo_preparacion(),
                    receta.getDificultad(),
                    receta.getImagen()
            );

            if (result) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            log.error("Error al guardar receta: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error al guardar la receta: " + e.getMessage());
        }
    }

    @PutMapping("/admin/recetas/updateReceta")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateReceta(@RequestBody Receta receta) {
        try {
            boolean result = recetaService.updateReceta(
                    receta.getId_receta(),
                    receta.getNombre(),
                    receta.getDescripcion(),
                    receta.getIngredientes(),
                    receta.getCantidades(),
                    receta.getCalorias(),
                    receta.getCantidad_carbohidratos(),
                    receta.getCantidad_proteinas(),
                    receta.getCantidad_grasas(),
                    receta.getTiempo_preparacion(),
                    receta.getDificultad(),
                    receta.getImagen()
            );

            if (result) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error al actualizar receta: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error al actualizar la receta: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/recetas/deleteReceta/{id_receta}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReceta(@PathVariable String id_receta) {
        try {
            boolean result = recetaService.deleteReceta(id_receta);
            if (result) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error al eliminar receta con id {}: {}", id_receta, e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error al eliminar la receta: " + e.getMessage());
        }
    }

    @DeleteMapping("/admin/recetas/deleteAllRecetas")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteAllRecetas() {
        try {
            boolean result = recetaService.deleteAllRecetas();
            if (result) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.internalServerError().build();
            }
        } catch (Exception e) {
            log.error("Error al eliminar todas las recetas: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error al eliminar todas las recetas: " + e.getMessage());
        }
    }
}