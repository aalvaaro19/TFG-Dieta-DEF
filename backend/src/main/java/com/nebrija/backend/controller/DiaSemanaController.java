package com.nebrija.backend.controller;

import com.nebrija.backend.model.DiaSemana;
import com.nebrija.backend.service.DiaSemanaService;
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
@RequestMapping("/api/dias-semana")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:4200")
public class DiaSemanaController {

    @Autowired
    private DiaSemanaService diaSemanaService;

    @GetMapping("/getAllDias")
    public ResponseEntity<List<DiaSemana>> getAllDiasUser() {
        try {
            List<DiaSemana> dias = diaSemanaService.getAllDiasSemana();
            return ResponseEntity.ok(dias);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener los días de la semana: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/admin/dias-semana/getAllDias")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DiaSemana>> getAllDias() {
        try {
            List<DiaSemana> dias = diaSemanaService.getAllDiasSemana();
            return ResponseEntity.ok(dias);
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener los días de la semana: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/admin/dias-semana/getDia/{id_dia}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiaSemana> getDia(@PathVariable String id_dia) {
        try {
            DiaSemana dia = diaSemanaService.getDiaSemanaById(id_dia);
            if (dia != null) {
                return ResponseEntity.ok(dia);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (ExecutionException | InterruptedException e) {
            log.error("Error al obtener el día de la semana: ", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/admin/dias-semana/saveDia")
    @PreAuthorize("hasRole('ADMIN')")
    public void saveDia(@RequestBody DiaSemana diaSemana) {
        diaSemanaService.createDiaSemana(diaSemana);
    }

    @PutMapping("/admin/dias-semana/updateDia")
    @PreAuthorize("hasRole('ADMIN')")
    public void updateDia(@RequestBody DiaSemana diaSemana) {
        diaSemanaService.updateDiaSemana(diaSemana);
    }

    @DeleteMapping("/admin/dias-semana/deleteDia/{id_dia}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteDia(@PathVariable String id_dia) {
        diaSemanaService.deleteDiaSemana(id_dia);
    }

    @DeleteMapping("/admin/dias-semana/deleteAllDias")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAllDias() {
        diaSemanaService.deleteAllDiasSemana();
    }
}
