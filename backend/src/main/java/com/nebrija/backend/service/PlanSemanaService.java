package com.nebrija.backend.service;

import com.google.api.core.ApiFuture;
import com.google.firebase.database.*;
import com.nebrija.backend.model.PlanSemana;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
public class PlanSemanaService {

    @Autowired
    private FirebaseService service;
    private final FirebaseDatabase firebaseDatabase;
    private static final String PLANES_PATH = "planesDeLaSemana";

    public PlanSemanaService(FirebaseDatabase firebaseDatabase) {
        this.firebaseDatabase = firebaseDatabase;
    }

    /**
     * Obtiene todos los planes de la semana
     * @return Lista de planes de la semana
     */
    public List<PlanSemana> getAllPlanesSemana() throws ExecutionException, InterruptedException {
        CompletableFuture<List<PlanSemana>> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<PlanSemana> planesList = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Map<String, Object> planData = (Map<String, Object>) snapshot.getValue();
                    if (planData != null) {
                        PlanSemana plan = PlanSemana.fromMap(planData);
                        planesList.add(plan);
                    }
                }
                future.complete(planesList);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get();
    }

    /**
     * Guarda un nuevo plan de la semana en Firebase
     * @param planSemana Plan de la semana a guardar
     * @return booleano indicando si la operación fue exitosa
     */
    public boolean createPlanSemana(PlanSemana planSemana) {
        try {
            if (planSemana.getId_planSemana() == null || planSemana.getId_planSemana().isEmpty()) {
                System.err.println("Error: El ID del plan no puede estar vacío");
                return false;
            }

            DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH).child(planSemana.getId_planSemana());
            ApiFuture<Void> future = ref.setValueAsync(planSemana.toMapRecetaReceta());
            future.get();
            System.out.println("Plan de la semana guardado correctamente: " + planSemana.getId_planSemana());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al guardar el plan: " + e.getMessage());
            return false;
        }
    }

    /**
     * Obtiene un plan de la semana por su ID
     * @param id_planSemana ID del plan de la semana
     * @return Plan de la semana encontrado o null si no existe
     */
    public PlanSemana getPlanSemanaById(String id_planSemana) throws ExecutionException, InterruptedException {
        CompletableFuture<PlanSemana> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH).child(id_planSemana);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Map<String, Object> planData = (Map<String, Object>) dataSnapshot.getValue();
                    if (planData != null) {
                        PlanSemana plan = PlanSemana.fromMap(planData);
                        future.complete(plan);
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
     * Actualiza un plan de la semana existente en Firebase
     * @param planSemana Plan de la semana con los datos actualizados
     * @return booleano indicando si la operación fue exitosa
     */
    public boolean updatePlanSemana(PlanSemana planSemana) {
        try {
            if (planSemana.getId_planSemana() == null || planSemana.getId_planSemana().isEmpty()) {
                System.err.println("Error: El ID del plan no puede estar vacío");
                return false;
            }

            DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH).child(planSemana.getId_planSemana());

            // Verificar primero si el plan existe
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
                System.err.println("Error: El plan con ID " + planSemana.getId_planSemana() + " no existe");
                return false;
            }

            ApiFuture<Void> future = ref.setValueAsync(planSemana.toMapRecetaReceta());
            future.get();
            System.out.println("Plan de la semana actualizado correctamente: " + planSemana.getId_planSemana());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al actualizar el plan: " + e.getMessage());
            return false;
        }
    }

    /**
     * Elimina un plan de la semana por su ID
     * @param id_planSemana ID del plan de la semana a eliminar
     * @return booleano indicando si la operación fue exitosa
     */
    public boolean deletePlanSemana(String id_planSemana) {
        try {
            if (id_planSemana == null || id_planSemana.isEmpty()) {
                System.err.println("Error: El ID del plan no puede estar vacío");
                return false;
            }

            DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH).child(id_planSemana);

            // Verificar primero si el plan existe
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
                System.err.println("Error: El plan con ID " + id_planSemana + " no existe");
                return false;
            }

            ApiFuture<Void> future = ref.removeValueAsync();
            future.get();
            System.out.println("Plan de la semana eliminado correctamente: " + id_planSemana);
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar el plan: " + e.getMessage());
            return false;
        }
    }

    /**
     * Elimina todos los planes de la semana
     * @return booleano indicando si la operación fue exitosa
     */
    public boolean deleteAllPlanesSemana() {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH);
            ApiFuture<Void> future = ref.removeValueAsync();
            future.get();
            System.out.println("Todos los planes de la semana eliminados correctamente.");
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar todos los planes: " + e.getMessage());
            return false;
        }
    }
}