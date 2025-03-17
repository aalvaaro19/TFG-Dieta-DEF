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
    private static final String USERS_PATH = "recetas";

    public RecetaService(FirebaseDatabase firebaseDatabase) {
        this.firebaseDatabase = firebaseDatabase;
    }

    // Metodo para obtener datos de las recetas en Firebase Realtime Database
    public List<Receta> getDataRecetas(String path) throws ExecutionException, InterruptedException {
        CompletableFuture<List<Receta>> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(path);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<Receta> recetaList = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Map<String, Object> recetaData = (Map<String, Object>) snapshot.getValue();
                    Receta receta = Receta.fromMap(recetaData);
                    recetaList.add(receta);
                }
                future.complete(recetaList);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get(); // Espera a que la operación finalice y devuelve la lista de recetas
    }

    // Metodo para guardar datos en Firebase Realtime Database
    public void createReceta(String id_receta, String nombre, String descripcion, List<String> ingredientes, String calorias,
                             String cantidad_carbohidratos, String cantidad_proteinas, String cantidad_grasas,
                             String tiempo_preparacion, String dificultad, String imagen) {
        try {
            // Create a new Receta object
            Receta receta = new Receta();
            receta.setId_receta(id_receta);
            receta.setNombre(nombre);
            receta.setDescripcion(descripcion);
            receta.setIngredientes(ingredientes);
            receta.setCalorias(calorias);
            receta.setCantidad_carbohidratos(cantidad_carbohidratos);
            receta.setCantidad_proteinas(cantidad_proteinas);
            receta.setCantidad_grasas(cantidad_grasas);
            receta.setTiempo_preparacion(tiempo_preparacion);
            receta.setDificultad(dificultad);
            receta.setImagen(imagen);

            // Save the Receta object to Firebase Realtime Database
            DatabaseReference ref = firebaseDatabase.getReference(USERS_PATH).child(id_receta);
            ApiFuture<Void> future = ref.setValueAsync(receta.toMapReceta());
            try {
                future.get(); // Wait until the operation completes
                System.out.println("Datos guardados correctamente.");
            } catch (InterruptedException | ExecutionException e) {
                System.err.println("Error al guardar datos: " + e.getMessage());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Metodo para actualizar una receta en Firebase Realtime Database
    public void updateReceta(String id_receta, String nombre, String descripcion, List<String> ingredientes, String calorias,
                             String cantidad_carbohidratos, String cantidad_proteinas, String cantidad_grasas,
                             String tiempo_preparacion, String dificultad, String imagen) {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(USERS_PATH).child(id_receta);

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
                        receta.setCalorias(calorias);
                        receta.setCantidad_carbohidratos(cantidad_carbohidratos);
                        receta.setCantidad_proteinas(cantidad_proteinas);
                        receta.setCantidad_grasas(cantidad_grasas);
                        receta.setTiempo_preparacion(tiempo_preparacion);
                        receta.setDificultad(dificultad);
                        receta.setImagen(imagen);

                        // Update the Receta object in Firebase Realtime Database
                        ApiFuture<Void> future = ref.setValueAsync(receta.toMapReceta());
                        try {
                            future.get(); // Wait until the operation completes
                            System.out.println("Datos actualizados correctamente.");
                        } catch (InterruptedException | ExecutionException e) {
                            System.err.println("Error al actualizar datos: " + e.getMessage());
                        }
                    } else {
                        System.err.println("La receta no existe.");
                    }
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    System.err.println("Error al verificar la existencia de la receta: " + databaseError.getMessage());
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Metodo para eliminar una receta de Firebase Realtime Database
    public void deleteReceta(String id_receta) {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(USERS_PATH).child(id_receta);

            // Check if the recipe exists
            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    if (dataSnapshot.exists()) {
                        // Delete the Receta object from Firebase Realtime Database
                        ApiFuture<Void> future = ref.removeValueAsync();
                        try {
                            future.get(); // Wait until the operation completes
                            System.out.println("Datos eliminados correctamente.");
                        } catch (InterruptedException | ExecutionException e) {
                            System.err.println("Error al eliminar datos: " + e.getMessage());
                        }
                    } else {
                        System.err.println("La receta no existe.");
                    }
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    System.err.println("Error al verificar la existencia de la receta: " + databaseError.getMessage());
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Metodo para eliminar todas las recetas de Firebase Realtime Database
    public void deleteAllRecetas() {
        try {
            DatabaseReference ref = firebaseDatabase.getReference(USERS_PATH);
            ApiFuture<Void> future = ref.removeValueAsync();
            try {
                future.get(); // Wait until the operation completes
                System.out.println("Datos eliminados correctamente.");
            } catch (InterruptedException | ExecutionException e) {
                System.err.println("Error al eliminar datos: " + e.getMessage());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    //Metodo para obtener una receta por su id
    public Receta getRecetaById(String id_receta) throws ExecutionException, InterruptedException {
        CompletableFuture<Receta> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(USERS_PATH).child(id_receta);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                Map<String, Object> recetaData = (Map<String, Object>) dataSnapshot.getValue();
                Receta receta = Receta.fromMap(recetaData);
                future.complete(receta);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get(); // Espera a que la operación finalice y devuelve la receta
    }
}
