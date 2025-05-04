package com.nebrija.backend.service;

import com.google.api.core.ApiFuture;
import com.google.firebase.database.*;
import com.nebrija.backend.model.Receta;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
public class RecetaService {

    @Autowired
    private FirebaseService service;
    private final FirebaseDatabase firebaseDatabase;
    private static final String RECETAS_PATH = "recetas";

    public RecetaService(FirebaseDatabase firebaseDatabase) {
        this.firebaseDatabase = firebaseDatabase;
    }
    public List<Receta> getDataRecetas(String path) throws ExecutionException, InterruptedException {
        CompletableFuture<List<Receta>> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(path);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<Receta> recetaList = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Map<String, Object> recetaData = (Map<String, Object>) snapshot.getValue();
                    if (recetaData != null) {
                        Receta receta = Receta.fromMap(recetaData);
                        recetaList.add(receta);
                    }
                }
                future.complete(recetaList);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get();
    }
    public boolean createReceta(String nombre, String descripcion, List<String> ingredientes, List<String> cantidades, String calorias,
                                String cantidad_carbohidratos, String cantidad_proteinas, String cantidad_grasas,
                                String tiempo_preparacion, String dificultad, String imagen) {
        try {
            // Generar un ID único automáticamente con push()
            DatabaseReference recetasRef = firebaseDatabase.getReference(RECETAS_PATH);
            String id_receta = recetasRef.push().getKey();

            if (id_receta == null || id_receta.isEmpty()) {
                System.err.println("Error: No se pudo generar un ID para la receta.");
                return false;
            }

            // Crear el objeto Receta
            Receta receta = new Receta();
            receta.setId_receta(id_receta);
            receta.setNombre(nombre);
            receta.setDescripcion(descripcion);
            receta.setIngredientes(ingredientes);
            receta.setCantidades(cantidades); // Aquí asignamos las cantidades
            receta.setCalorias(calorias);
            receta.setCantidad_carbohidratos(cantidad_carbohidratos);
            receta.setCantidad_proteinas(cantidad_proteinas);
            receta.setCantidad_grasas(cantidad_grasas);
            receta.setTiempo_preparacion(tiempo_preparacion);
            receta.setDificultad(dificultad);
            receta.setImagen(imagen);

            // Guardar en Firebase
            DatabaseReference ref = recetasRef.child(id_receta);
            ApiFuture<Void> future = ref.setValueAsync(receta.toMapReceta());
            future.get();

            System.out.println("Receta guardada correctamente con ID generado: " + id_receta);
            return true;

        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al guardar la receta: " + e.getMessage());
            return false;
        }
    }

    public boolean updateReceta(String id_receta, String nombre, String descripcion, List<String> ingredientes, List<String> cantidades, String calorias,
                                String cantidad_carbohidratos, String cantidad_proteinas, String cantidad_grasas,
                                String tiempo_preparacion, String dificultad, String imagen) {
        try {
            if (id_receta == null || id_receta.isEmpty()) {
                System.err.println("Error: El ID de la receta no puede estar vacío");
                return false;
            }

            DatabaseReference ref = firebaseDatabase.getReference(RECETAS_PATH).child(id_receta);
            CompletableFuture<Boolean> future = new CompletableFuture<>();

            // Check if the recipe exists
            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    if (dataSnapshot.exists()) {
                        // Create a new Receta object
                        Receta receta = new Receta();
                        receta.setId_receta(id_receta);
                        receta.setNombre(nombre);
                        receta.setDescripcion(descripcion);
                        receta.setIngredientes(ingredientes);
                        receta.setCantidades(cantidades); // Añadido: cantidades en la actualización
                        receta.setCalorias(calorias);
                        receta.setCantidad_carbohidratos(cantidad_carbohidratos);
                        receta.setCantidad_proteinas(cantidad_proteinas);
                        receta.setCantidad_grasas(cantidad_grasas);
                        receta.setTiempo_preparacion(tiempo_preparacion);
                        receta.setDificultad(dificultad);
                        receta.setImagen(imagen);

                        // Update the Receta object in Firebase Realtime Database
                        try {
                            ApiFuture<Void> updateFuture = ref.setValueAsync(receta.toMapReceta());
                            updateFuture.get();
                            System.out.println("Receta actualizada correctamente: " + id_receta);
                            future.complete(true);
                        } catch (InterruptedException | ExecutionException e) {
                            System.err.println("Error al actualizar la receta: " + e.getMessage());
                            future.complete(false);
                        }
                    } else {
                        System.err.println("La receta con ID " + id_receta + " no existe");
                        future.complete(false);
                    }
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    System.err.println("Error al verificar la existencia de la receta: " + databaseError.getMessage());
                    future.complete(false);
                }
            });

            return future.get();
        } catch (Exception e) {
            System.err.println("Error general al actualizar la receta: " + e.getMessage());
            return false;
        }
    }
    public boolean deleteReceta(String id_receta) {
        try {
            if (id_receta == null || id_receta.isEmpty()) {
                System.err.println("Error: El ID de la receta no puede estar vacío");
                return false;
            }

            DatabaseReference ref = firebaseDatabase.getReference(RECETAS_PATH).child(id_receta);
            CompletableFuture<Boolean> future = new CompletableFuture<>();

            // Check if the recipe exists
            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    if (dataSnapshot.exists()) {
                        // Delete the Receta object from Firebase Realtime Database
                        try {
                            ApiFuture<Void> deleteFuture = ref.removeValueAsync();
                            deleteFuture.get();
                            System.out.println("Receta eliminada correctamente: " + id_receta);
                            future.complete(true);
                        } catch (InterruptedException | ExecutionException e) {
                            System.err.println("Error al eliminar la receta: " + e.getMessage());
                            future.complete(false);
                        }
                    } else {
                        System.err.println("La receta con ID " + id_receta + " no existe");
                        future.complete(false);
                    }
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    System.err.println("Error al verificar la existencia de la receta: " + databaseError.getMessage());
                    future.complete(false);
                }
            });

            return future.get();
        } catch (Exception e) {
            System.err.println("Error general al eliminar la receta: " + e.getMessage());
            return false;
        }
    }
    public boolean deleteAllRecetas() {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(RECETAS_PATH);
            ApiFuture<Void> future = ref.removeValueAsync();
            future.get();
            System.out.println("Todas las recetas eliminadas correctamente");
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar todas las recetas: " + e.getMessage());
            return false;
        }
    }
    public Receta getRecetaById(String id_receta) throws ExecutionException, InterruptedException {
        CompletableFuture<Receta> future = new CompletableFuture<>();

        if (id_receta == null || id_receta.isEmpty()) {
            throw new IllegalArgumentException("El ID de la receta no puede estar vacío");
        }

        DatabaseReference ref = firebaseDatabase.getReference(RECETAS_PATH).child(id_receta);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Map<String, Object> recetaData = (Map<String, Object>) dataSnapshot.getValue();
                    if (recetaData != null) {
                        Receta receta = Receta.fromMap(recetaData);
                        future.complete(receta);
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
}