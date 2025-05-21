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
    private FirebaseService firebaseService;
    private final FirebaseDatabase firebaseDatabase;
    private static final String PLANES_PATH = "planesSemana";

    public PlanSemanaService(FirebaseDatabase firebaseDatabase) {
        this.firebaseDatabase = firebaseDatabase;
    }

    // Obtener todos los planes de la semana
    public List<PlanSemana> getAllPlanesSemana() throws ExecutionException, InterruptedException {
        CompletableFuture<List<PlanSemana>> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<PlanSemana> planesList = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Map<String, Object> planData = (Map<String, Object>) snapshot.getValue();
                    PlanSemana plan = PlanSemana.fromMap(planData);
                    planesList.add(plan);
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

    // Guardar un plan de la semana en Firebase
    public void createPlanSemana(PlanSemana planSemana) {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH).child(planSemana.getId_PlanSemana());
            ApiFuture<Void> future = ref.setValueAsync(planSemana.toMapPlanSemana());
            future.get();
            System.out.println("Plan de la semana guardado correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al guardar el plan: " + e.getMessage());
        }
    }

    // Obtener un plan de la semana por su ID
    public PlanSemana getPlanSemanaById(String id_PlanSemana) throws ExecutionException, InterruptedException {
        CompletableFuture<PlanSemana> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH).child(id_PlanSemana);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Map<String, Object> planData = (Map<String, Object>) dataSnapshot.getValue();
                    PlanSemana plan = PlanSemana.fromMap(planData);
                    future.complete(plan);
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

    // Actualizar un plan de la semana en Firebase
    public void updatePlanSemana(PlanSemana planSemana) {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH).child(planSemana.getId_PlanSemana());
            ApiFuture<Void> future = ref.setValueAsync(planSemana.toMapPlanSemana());
            future.get();
            System.out.println("Plan de la semana actualizado correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al actualizar el plan: " + e.getMessage());
        }
    }

    // Eliminar un plan de la semana por ID
    public void deletePlanSemana(String id_PlanSemana) {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH).child(id_PlanSemana);
            ApiFuture<Void> future = ref.removeValueAsync();
            future.get();
            System.out.println("Plan de la semana eliminado correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar el plan: " + e.getMessage());
        }
    }

    // Eliminar todos los planes de la semana
    public void deleteAllPlanesSemana() {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH);
            ApiFuture<Void> future = ref.removeValueAsync();
            future.get();
            System.out.println("Todos los planes de la semana eliminados correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar todos los planes: " + e.getMessage());
        }
    }

    // Obtener todos los planes de un usuario específico
    public List<PlanSemana> getPlanesUsuario(String idUsuario) throws ExecutionException, InterruptedException {
        CompletableFuture<List<PlanSemana>> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(PLANES_PATH);
        Query query = ref.orderByChild("id_usuario").equalTo(idUsuario);

        query.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<PlanSemana> planesList = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Map<String, Object> planData = (Map<String, Object>) snapshot.getValue();
                    PlanSemana plan = PlanSemana.fromMap(planData);
                    planesList.add(plan);
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
}
