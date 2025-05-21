package com.nebrija.backend.service;

import com.google.api.core.ApiFuture;
import com.google.firebase.database.*;
import com.nebrija.backend.model.DiaSemana;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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

    // Obtener todos los días de la semana
    public List<DiaSemana> getAllDiasSemana() throws ExecutionException, InterruptedException {
        CompletableFuture<List<DiaSemana>> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<DiaSemana> diasList = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    try {
                        Map<String, Object> diaData = (Map<String, Object>) snapshot.getValue();
                        if (diaData != null) {
                            DiaSemana dia = DiaSemana.fromMap(diaData);
                            // Asignar el ID del snapshot si no existe en los datos
                            if (dia.getId_diaSemana() == null || dia.getId_diaSemana().isEmpty()) {
                                dia.setId_diaSemana(snapshot.getKey());
                            }
                            diasList.add(dia);
                        } else {
                            System.out.println("Datos nulos encontrados para el día con ID: " + snapshot.getKey());
                        }
                    } catch (Exception e) {
                        System.err.println("Error al procesar día con ID " + snapshot.getKey() + ": " + e.getMessage());
                    }
                }
                System.out.println("Se encontraron " + diasList.size() + " días de la semana");
                future.complete(diasList);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                System.err.println("Error al obtener días de la semana: " + databaseError.getMessage());
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get();
    }

    // Guardar un día de la semana en Firebase
    public String createDiaSemana(DiaSemana diaSemana) {
        try {
            // Validación de datos
            if (diaSemana == null) {
                System.err.println("Error: El día de la semana no puede ser nulo");
                return null;
            }

            // Generar ID si no existe o está vacío
            if (diaSemana.getId_diaSemana() == null || diaSemana.getId_diaSemana().isEmpty()) {
                // Opción 1: Generar un UUID
                String newId = UUID.randomUUID().toString();
                diaSemana.setId_diaSemana(newId);

                // Opción 2 (alternativa): Dejar que Firebase genere el ID
                // DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).push();
                // String newId = ref.getKey();
                // diaSemana.setId_diaSemana(newId);

                System.out.println("ID generado para el día: " + diaSemana.getId_diaSemana());
            }

            // Validar campo obligatorio
            if (diaSemana.getDia_semana() == null) {
                System.err.println("Error: El día de la semana no puede ser nulo para el ID: " + diaSemana.getId_diaSemana());
                return null;
            }

            // Guardar en Firebase
            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(diaSemana.getId_diaSemana());
            ApiFuture<Void> future = ref.setValueAsync(diaSemana.toMapRecetaReceta());
            future.get();
            System.out.println("Día guardado correctamente con ID: " + diaSemana.getId_diaSemana());

            return diaSemana.getId_diaSemana(); // Devolver el ID generado o utilizado
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al guardar el día: " + e.getMessage());
            return null;
        } catch (Exception e) {
            System.err.println("Error inesperado al guardar el día: " + e.getMessage());
            return null;
        }
    }

    // Obtener un día de la semana por su ID
    public DiaSemana getDiaSemanaById(String id_diaSemana) throws ExecutionException, InterruptedException {
        if (id_diaSemana == null || id_diaSemana.isEmpty()) {
            System.err.println("Error: El ID del día no puede estar vacío");
            return null;
        }

        CompletableFuture<DiaSemana> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(id_diaSemana);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    try {
                        Map<String, Object> diaData = (Map<String, Object>) dataSnapshot.getValue();
                        if (diaData != null) {
                            DiaSemana dia = DiaSemana.fromMap(diaData);
                            // Asegurarse de que el ID esté establecido
                            if (dia.getId_diaSemana() == null || dia.getId_diaSemana().isEmpty()) {
                                dia.setId_diaSemana(dataSnapshot.getKey());
                            }
                            System.out.println("Día encontrado: " + id_diaSemana);
                            future.complete(dia);
                        } else {
                            System.out.println("Datos nulos para el día: " + id_diaSemana);
                            future.complete(null);
                        }
                    } catch (Exception e) {
                        System.err.println("Error al convertir datos del día " + id_diaSemana + ": " + e.getMessage());
                        future.completeExceptionally(e);
                    }
                } else {
                    System.out.println("No se encontró el día con ID: " + id_diaSemana);
                    future.complete(null);
                }
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                System.err.println("Error al buscar el día: " + databaseError.getMessage());
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get();
    }

    // Actualizar un día de la semana en Firebase
    public boolean updateDiaSemana(DiaSemana diaSemana) {
        try {
            // Validación de datos
            if (diaSemana == null) {
                System.err.println("Error: El día de la semana no puede ser nulo");
                return false;
            }

            if (diaSemana.getId_diaSemana() == null || diaSemana.getId_diaSemana().isEmpty()) {
                System.err.println("Error: El ID del día no puede estar vacío para actualización");
                return false;
            }

            // Verificar que el día existe antes de actualizar
            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(diaSemana.getId_diaSemana());
            CompletableFuture<Boolean> checkExists = new CompletableFuture<>();

            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    checkExists.complete(dataSnapshot.exists());
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    System.err.println("Error al verificar existencia: " + databaseError.getMessage());
                    checkExists.completeExceptionally(databaseError.toException());
                }
            });

            if (!checkExists.get()) {
                System.err.println("Error: No existe un día con ID " + diaSemana.getId_diaSemana());
                return false;
            }

            ApiFuture<Void> future = ref.setValueAsync(diaSemana.toMapRecetaReceta());
            future.get();
            System.out.println("Día actualizado correctamente: " + diaSemana.getId_diaSemana());
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al actualizar el día: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("Error inesperado al actualizar el día: " + e.getMessage());
            return false;
        }
    }

    // Eliminar un día de la semana por ID
    public boolean deleteDiaSemana(String id_diaSemana) {
        try {
            if (id_diaSemana == null || id_diaSemana.isEmpty()) {
                System.err.println("Error: El ID del día no puede estar vacío");
                return false;
            }

            // Verificar que el día existe antes de eliminar
            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(id_diaSemana);
            CompletableFuture<Boolean> checkExists = new CompletableFuture<>();

            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    checkExists.complete(dataSnapshot.exists());
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    System.err.println("Error al verificar existencia: " + databaseError.getMessage());
                    checkExists.completeExceptionally(databaseError.toException());
                }
            });

            if (!checkExists.get()) {
                System.err.println("Error: No existe un día con ID " + id_diaSemana);
                return false;
            }

            ApiFuture<Void> future = ref.removeValueAsync();
            future.get();
            System.out.println("Día eliminado correctamente: " + id_diaSemana);
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar el día: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("Error inesperado al eliminar el día: " + e.getMessage());
            return false;
        }
    }

    // Eliminar todos los días de la semana
    public boolean deleteAllDiasSemana() {
        try {
            System.out.println("Eliminando todos los días de la semana - OPERACIÓN DESTRUCTIVA");
            DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH);
            ApiFuture<Void> future = ref.removeValueAsync();
            future.get();
            System.out.println("Todos los días eliminados correctamente.");
            return true;
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar todos los días: " + e.getMessage());
            return false;
        } catch (Exception e) {
            System.err.println("Error inesperado al eliminar todos los días: " + e.getMessage());
            return false;
        }
    }

    // Obtener días de la semana por fecha
    public List<DiaSemana> getDiaSemanaByFecha(String fecha) throws ExecutionException, InterruptedException {
        if (fecha == null || fecha.isEmpty()) {
            System.err.println("Error: La fecha no puede estar vacía");
            return new ArrayList<>();
        }

        CompletableFuture<List<DiaSemana>> future = new CompletableFuture<>();
        List<DiaSemana> diasFiltrados = new ArrayList<>();

        DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH);
        Query query = ref.orderByChild("fechaDia").equalTo(fecha);

        query.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    try {
                        Map<String, Object> diaData = (Map<String, Object>) snapshot.getValue();
                        if (diaData != null) {
                            DiaSemana dia = DiaSemana.fromMap(diaData);
                            // Asegurarse de que el ID esté establecido
                            if (dia.getId_diaSemana() == null || dia.getId_diaSemana().isEmpty()) {
                                dia.setId_diaSemana(snapshot.getKey());
                            }
                            diasFiltrados.add(dia);
                        }
                    } catch (Exception e) {
                        System.err.println("Error al procesar día con ID " + snapshot.getKey() + ": " + e.getMessage());
                    }
                }
                System.out.println("Se encontraron " + diasFiltrados.size() + " días con fecha: " + fecha);
                future.complete(diasFiltrados);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                System.err.println("Error al buscar días por fecha: " + databaseError.getMessage());
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get();
    }

    // Comprobar si existe un día de la semana por su ID
    public boolean existsDiaSemana(String id_diaSemana) throws ExecutionException, InterruptedException {
        if (id_diaSemana == null || id_diaSemana.isEmpty()) {
            return false;
        }

        CompletableFuture<Boolean> future = new CompletableFuture<>();
        DatabaseReference ref = firebaseDatabase.getReference(DIAS_PATH).child(id_diaSemana);

        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                future.complete(dataSnapshot.exists());
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                System.err.println("Error al verificar existencia: " + databaseError.getMessage());
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get();
    }
}