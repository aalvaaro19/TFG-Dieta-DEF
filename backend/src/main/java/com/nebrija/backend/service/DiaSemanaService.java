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

    /**
     * Obtiene todos los días de la semana desde Firebase
     * @return Lista de días de la semana
     */
    public List<DiaSemana> getAllDiasSemana() throws ExecutionException, InterruptedException {
        CompletableFuture<List<DiaSemana>> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<DiaSemana> diasList = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Map<String, Object> diaData = (Map<String, Object>) snapshot.getValue();
                    if (diaData != null) {
                        DiaSemana dia = DiaSemana.fromMap(diaData);
                        diasList.add(dia);
                    }
                }
                future.complete(diasList);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get();
    }

    /**
     * Guarda un día de la semana en Firebase
     * @param diaSemana Día de la semana a guardar
     * @return booleano indicando si la operación fue exitosa
     */
    public boolean createDiaSemana(DiaSemana diaSemana) {
        try {
            if (diaSemana.getId_diaSemana() == null || diaSemana.getId_diaSemana().isEmpty()) {
                System.err.println("Error: El ID del día no puede estar vacío");
                return false;
            }

            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(diaSemana.getId_diaSemana());
            ApiFuture<Void> future = ref.setValueAsync(diaSemana.toMapRecetaReceta());
            future.get();
            System.out.println("Día guardado correctamente: " + diaSemana.getId_diaSemana());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al guardar el día: " + e.getMessage());
            return false;
        }
    }

    /**
     * Obtiene un día de la semana por su ID
     * @param id_diaSemana ID del día de la semana
     * @return Día de la semana encontrado o null si no existe
     */
    public DiaSemana getDiaSemanaById(String id_diaSemana) throws ExecutionException, InterruptedException {
        CompletableFuture<DiaSemana> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(id_diaSemana);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Map<String, Object> diaData = (Map<String, Object>) dataSnapshot.getValue();
                    if (diaData != null) {
                        DiaSemana dia = DiaSemana.fromMap(diaData);
                        future.complete(dia);
                    } else {
                        future.complete(null);
                    }
                } else {
                    future.complete(null);
                }
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get();
    }

    /**
     * Actualiza un día de la semana en Firebase
     * @param diaSemana Día de la semana con los datos actualizados
     * @return booleano indicando si la operación fue exitosa
     */
    public boolean updateDiaSemana(DiaSemana diaSemana) {
        try {
            if (diaSemana.getId_diaSemana() == null || diaSemana.getId_diaSemana().isEmpty()) {
                System.err.println("Error: El ID del día no puede estar vacío");
                return false;
            }

            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(diaSemana.getId_diaSemana());

            // Verificar primero si el día existe
            CompletableFuture<Boolean> checkExists = new CompletableFuture<>();
            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    checkExists.complete(dataSnapshot.exists());
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    checkExists.completeExceptionally(databaseError.toException());
                }
            });

            if (!checkExists.get()) {
                System.err.println("Error: El día con ID " + diaSemana.getId_diaSemana() + " no existe");
                return false;
            }

            ApiFuture<Void> future = ref.setValueAsync(diaSemana.toMapRecetaReceta());
            future.get();
            System.out.println("Día actualizado correctamente: " + diaSemana.getId_diaSemana());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al actualizar el día: " + e.getMessage());
            return false;
        }
    }

    /**
     * Elimina un día de la semana en Firebase
     * @param id_diaSemana ID del día de la semana a eliminar
     * @return booleano indicando si la operación fue exitosa
     */
    public boolean deleteDiaSemana(String id_diaSemana) {
        try {
            if (id_diaSemana == null || id_diaSemana.isEmpty()) {
                System.err.println("Error: El ID del día no puede estar vacío");
                return false;
            }

            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(id_diaSemana);

            // Verificar primero si el día existe
            CompletableFuture<Boolean> checkExists = new CompletableFuture<>();
            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    checkExists.complete(dataSnapshot.exists());
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    checkExists.completeExceptionally(databaseError.toException());
                }
            });

            if (!checkExists.get()) {
                System.err.println("Error: El día con ID " + id_diaSemana + " no existe");
                return false;
            }

            ApiFuture<Void> future = ref.removeValueAsync();
            future.get();
            System.out.println("Día eliminado correctamente: " + id_diaSemana);
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar el día: " + e.getMessage());
            return false;
        }
    }

    /**
     * Elimina todos los días de la semana de Firebase
     * @return booleano indicando si la operación fue exitosa
     */
    public boolean deleteAllDiasSemana() {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH);
            ApiFuture<Void> future = ref.removeValueAsync();
            future.get();
            System.out.println("Todos los días eliminados correctamente.");
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar todos los días: " + e.getMessage());
            return false;
        }
    }
}