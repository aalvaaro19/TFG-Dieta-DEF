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
            log.error(String.valueOf(e));
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/admin/recetas/getReceta/{id_receta}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Receta> getReceta(@PathVariable String id_receta) {
        try {
            List<Receta> recetas = recetaService.getDataRecetas("recetas");
            for (Receta receta : recetas) {
                if (receta.getId_receta().equals(id_receta)) {
                    return ResponseEntity.ok(receta);
                }
            }
            return ResponseEntity.notFound().build();
        } catch (ExecutionException | InterruptedException e) {
            log.error(String.valueOf(e));
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/admin/recetas/saveReceta")
    @PreAuthorize("hasRole('ADMIN')")
    public void saveReceta(@RequestBody Receta receta) {
        recetaService.createReceta(receta.getId_receta(), receta.getNombre(), receta.getDescripcion(), receta.getIngredientes(), receta.getCalorias(),
                receta.getCantidad_carbohidratos(), receta.getCantidad_proteinas(), receta.getCantidad_grasas(), receta.getTiempo_preparacion(), receta.getDificultad(), receta.getImagen());
    }

    @PutMapping("/admin/recetas/updateReceta")
    @PreAuthorize("hasRole('ADMIN')")
    public void updateReceta(@RequestBody Receta receta) {
        recetaService.updateReceta(receta.getId_receta(), receta.getNombre(), receta.getDescripcion(), receta.getIngredientes(), receta.getCalorias(),
                receta.getCantidad_carbohidratos(), receta.getCantidad_proteinas(), receta.getCantidad_grasas(), receta.getTiempo_preparacion(), receta.getDificultad(), receta.getImagen());
    }

    @DeleteMapping("/admin/recetas/deleteReceta/{id_receta}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteReceta(@PathVariable String id_receta) {
        recetaService.deleteReceta(id_receta);
    }

    @DeleteMapping("/admin/recetas/deleteAllRecetas")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAllRecetas() {
        recetaService.deleteAllRecetas();
    }

}
