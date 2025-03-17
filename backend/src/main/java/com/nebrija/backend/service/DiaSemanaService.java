package com.nebrija.backend.service;

import com.google.api.core.ApiFuture;
import com.google.firebase.database.*;
import com.nebrija.backend.model.DiaSemana;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
public class DiaSemanaService {

    @Autowired
    private FirebaseService service;
    private final FirebaseDatabase firebaseDatabase;
    private static final String DIAS_PATH = "diasDeLaSemana";

    public DiaSemanaService(FirebaseDatabase firebaseDatabase) {
        this.firebaseDatabase = firebaseDatabase;
    }

    // Obtener todos los días de la semana desde Firebase
    public List<DiaSemana> getAllDiasSemana() throws ExecutionException, InterruptedException {
        CompletableFuture<List<DiaSemana>> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<DiaSemana> diasList = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Map<String, Object> diaData = (Map<String, Object>) snapshot.getValue();
                    DiaSemana dia = DiaSemana.fromMap(diaData);
                    diasList.add(dia);
                }
                future.complete(diasList);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get(); // Espera a que la operación finalice y devuelve la lista de días
    }

    // Guardar un día de la semana en Firebase
    public void createDiaSemana(DiaSemana diaSemana) {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(diaSemana.getId_diaSemana());
            ApiFuture<Void> future = ref.setValueAsync(diaSemana.toMapRecetaReceta());
            future.get(); // Espera hasta que la operación finalice
            System.out.println("Día guardado correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al guardar el día: " + e.getMessage());
        }
    }

    // Obtener un día de la semana por su ID
    public DiaSemana getDiaSemanaById(String id_diaSemana) throws ExecutionException, InterruptedException {
        CompletableFuture<DiaSemana> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(id_diaSemana);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Map<String, Object> diaData = (Map<String, Object>) dataSnapshot.getValue();
                    DiaSemana dia = DiaSemana.fromMap(diaData);
                    future.complete(dia);
                } else {
                    future.complete(null);
                }
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get(); // Espera a que la operación finalice y devuelve el día
    }

    // Actualizar un día de la semana en Firebase
    public void updateDiaSemana(DiaSemana diaSemana) {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(diaSemana.getId_diaSemana());
            ApiFuture<Void> future = ref.setValueAsync(diaSemana.toMapRecetaReceta());
            future.get(); // Espera hasta que la operación finalice
            System.out.println("Día actualizado correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al actualizar el día: " + e.getMessage());
        }
    }

    // Eliminar un día de la semana en Firebase
    public void deleteDiaSemana(String id_diaSemana) {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(id_diaSemana);
            ApiFuture<Void> future = ref.removeValueAsync();
            future.get(); // Espera hasta que la operación finalice
            System.out.println("Día eliminado correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar el día: " + e.getMessage());
        }
    }

    // Eliminar todos los días de la semana de Firebase
    public void deleteAllDiasSemana() {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH);
            ApiFuture<Void> future = ref.removeValueAsync();
            future.get(); // Espera hasta que la operación finalice
            System.out.println("Todos los días eliminados correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar todos los días: " + e.getMessage());
        }
    }
}