package com.nebrija.backend.service;

import com.google.api.core.ApiFuture;
import com.google.firebase.database.*;
import com.nebrija.backend.model.Progreso;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
public class ProgresoService {

    @Autowired
    private FirebaseService service;
    private final FirebaseDatabase firebaseDatabase;
    private static final String PROGRESOS_PATH = "progresos";

    public ProgresoService(FirebaseDatabase firebaseDatabase) {
        this.firebaseDatabase = firebaseDatabase;
    }

    // Obtener todos los progresos
    public List<Progreso> getAllProgresos() throws ExecutionException, InterruptedException {
        CompletableFuture<List<Progreso>> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(PROGRESOS_PATH);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<Progreso> progresosList = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Map<String, Object> progresoData = (Map<String, Object>) snapshot.getValue();
                    Progreso progreso = Progreso.fromMap(progresoData);
                    progresosList.add(progreso);
                }
                future.complete(progresosList);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get();
    }

    // Guardar un progreso en Firebase
    public void createProgreso(Progreso progreso) {
        try {
            // Generate ID if not provided
            if (progreso.getId_progreso() == null || progreso.getId_progreso().isEmpty()) {
                // Generate a new ID using UUID
                progreso.setId_progreso(UUID.randomUUID().toString());
            }

            DatabaseReference ref = firebaseDatabase.getReference(PROGRESOS_PATH).child(progreso.getId_progreso());
            ApiFuture<Void> future = ref.setValueAsync(progreso.toMap());
            future.get();
            System.out.println("Progreso guardado correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al guardar el progreso: " + e.getMessage());
        }
    }

    // Obtener un progreso por su ID
    public Progreso getProgresoById(String id_progreso) throws ExecutionException, InterruptedException {
        CompletableFuture<Progreso> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(PROGRESOS_PATH).child(id_progreso);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Map<String, Object> progresoData = (Map<String, Object>) dataSnapshot.getValue();
                    Progreso progreso = Progreso.fromMap(progresoData);
                    future.complete(progreso);
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

    // Obtener todos los progresos de un usuario
    public List<Progreso> getProgresosByUserId(String id_usuario) throws ExecutionException, InterruptedException {
        CompletableFuture<List<Progreso>> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(PROGRESOS_PATH);
        Query query = ref.orderByChild("id_usuario").equalTo(id_usuario);

        query.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<Progreso> progresosList = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Map<String, Object> progresoData = (Map<String, Object>) snapshot.getValue();
                    Progreso progreso = Progreso.fromMap(progresoData);
                    progresosList.add(progreso);
                }
                future.complete(progresosList);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get();
    }

    // Actualizar un progreso en Firebase
    public void updateProgreso(Progreso progreso) {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(PROGRESOS_PATH).child(progreso.getId_progreso());
            ApiFuture<Void> future = ref.setValueAsync(progreso.toMap());
            future.get();
            System.out.println("Progreso actualizado correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al actualizar el progreso: " + e.getMessage());
        }
    }

    // Eliminar un progreso por ID
    public void deleteProgreso(String id_progreso) {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(PROGRESOS_PATH).child(id_progreso);
            ApiFuture<Void> future = ref.removeValueAsync();
            future.get();
            System.out.println("Progreso eliminado correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar el progreso: " + e.getMessage());
        }
    }

    // Eliminar todos los progresos
    public void deleteAllProgresos() {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(PROGRESOS_PATH);
            ApiFuture<Void> future = ref.removeValueAsync();
            future.get();
            System.out.println("Todos los progresos eliminados correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar todos los progresos: " + e.getMessage());
        }
    }
}