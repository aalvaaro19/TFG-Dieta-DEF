package com.nebrija.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.database.*;
import com.nebrija.backend.model.enums.Role;
import com.nebrija.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserService {

    @Autowired
    private FirebaseService service;
    private final FirebaseDatabase firebaseDatabase;
    private static final String USERS_PATH = "users";

    public User findUserByUid(String uid) throws ExecutionException, InterruptedException {
        CompletableFuture<User> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(USERS_PATH).child(uid);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Map<String, Object> userData = (Map<String, Object>) dataSnapshot.getValue();
                    User user = User.fromMap(userData);
                    future.complete(user);
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

    public void createUser(String email, String password, String nombreUsuario, String nombreCompleto,
                           String telefono, String direccion, double peso, double altura, String sexo, int edad, String objetivo, String imagen) {
        try {
            UserRecord userRecord;

            try {
                userRecord = FirebaseAuth.getInstance().getUserByEmail(email);
            } catch (FirebaseAuthException e) {
                UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                        .setEmail(email)
                        .setPassword(password)
                        .setDisplayName(nombreCompleto);
                userRecord = FirebaseAuth.getInstance().createUser(request);
            }

            User user = new User();
            user.setId_usuario(userRecord.getUid());
            user.setNombreUsuario(nombreUsuario);
            user.setNombreCompleto(nombreCompleto);
            user.setTelefono(telefono);
            user.setDireccion(direccion);
            user.setEmail(email);
            user.setPassword(password);
            user.setPeso(peso);
            user.setAltura(altura);
            user.setSexo(sexo);
            user.setEdad(edad);
            user.setObjetivo(objetivo);
            user.setImagen(imagen);
            user.setRol(Role.USER);

            service.saveUserToRealtimeDatabase(user);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Metodo para actualizar un usuario en Firebase Auth y en Realtime Database
    public void updateUser(String uid, String nombreUsuario, String nombreCompleto, String telefono, String direccion, String email, String password, double peso, double altura, String sexo, int edad, String objetivo, String imagen) {
        try {
            UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(uid)
                    .setDisplayName(nombreCompleto);
            FirebaseAuth.getInstance().updateUser(request);

            User user = new User();
            user.setId_usuario(uid);
            user.setNombreUsuario(nombreUsuario);
            user.setNombreCompleto(nombreCompleto);
            user.setTelefono(telefono);
            user.setDireccion(direccion);
            user.setEmail(email);
            user.setPassword(password);
            user.setPeso(peso);
            user.setAltura(altura);
            user.setEdad(edad);
            user.setSexo(sexo);
            user.setObjetivo(objetivo);
            user.setImagen(imagen);

            service.updateUserInRealtimeDatabase(user);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Metodo para eliminar un usuario - CORREGIDO
    public void deleteUser(String uid, String idToken) throws Exception {
        try {
            System.out.println("🔍 Iniciando eliminación de usuario: " + uid);
            System.out.println("🔍 Token recibido: " + idToken.substring(0, Math.min(20, idToken.length())) + "...");

            // Verificar el token de ID para obtener el UID del usuario autenticado
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String authUid = decodedToken.getUid();

            System.out.println("🔍 Usuario autenticado: " + authUid);
            System.out.println("🔍 Usuario a eliminar: " + uid);

            // Obtener el rol del usuario autenticado desde la base de datos
            String userRole = getUserRoleFromDatabase(authUid); // CORREGIDO: método separado

            System.out.println("🔍 Rol del usuario autenticado: " + userRole);

            // Validar que el usuario no se esté eliminando a sí mismo si es necesario
            // (Comentado porque algunos sistemas sí permiten auto-eliminación)
            // if (authUid.equals(uid)) {
            //     throw new Exception("No puedes eliminarte a ti mismo.");
            // }

            boolean canDelete = false;

            // Si el usuario es ADMIN, puede eliminar a cualquier usuario
            if ("ADMIN".equals(userRole)) {
                System.out.println("✅ Usuario admin puede eliminar cualquier usuario");
                canDelete = true;
            }
            // Si el usuario es USER, solo puede eliminar su propio usuario
            else if ("USER".equals(userRole) && authUid.equals(uid)) {
                System.out.println("✅ Usuario puede eliminar su propio perfil");
                canDelete = true;
            }

            if (!canDelete) {
                throw new Exception("No tienes permisos para eliminar este usuario.");
            }

            // Proceder con la eliminación
            System.out.println("🔍 Eliminando usuario de Realtime Database...");
            deleteUserFromRealtimeDatabase(uid);

            System.out.println("🔍 Eliminando usuario de Firebase Auth...");
            deleteUserFromFirebaseAuth(uid);

            System.out.println("✅ Usuario eliminado exitosamente: " + uid);

        } catch (FirebaseAuthException e) {
            System.err.println("❌ Error de Firebase Auth: " + e.getMessage());
            System.err.println("❌ Código de error: " + e.getErrorCode());
            throw new Exception("Error al verificar el token: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Error general: " + e.getMessage());
            throw e;
        }
    }

    // ✅ Metodo CORREGIDO para obtener el rol del usuario
    private String getUserRoleFromDatabase(String uid) throws Exception {
        try {
            System.out.println("🔍 Obteniendo rol para usuario: " + uid);

            // Obtener referencia al usuario en Realtime Database
            DatabaseReference userRef = FirebaseDatabase.getInstance().getReference("users").child(uid);

            // Hacer la consulta síncrona
            CompletableFuture<String> future = new CompletableFuture<>();

            userRef.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot dataSnapshot) {
                    try {
                        if (dataSnapshot.exists()) {
                            String role = dataSnapshot.child("rol").getValue(String.class);
                            System.out.println("🔍 Rol encontrado: " + role);
                            future.complete(role != null ? role : "USER"); // Default a USER si no hay rol
                        } else {
                            System.out.println("⚠️ Usuario no encontrado en database, asignando rol USER");
                            future.complete("USER");
                        }
                    } catch (Exception e) {
                        future.completeExceptionally(e);
                    }
                }

                @Override
                public void onCancelled(DatabaseError databaseError) {
                    System.err.println("❌ Error accediendo a database: " + databaseError.getMessage());
                    future.completeExceptionally(new Exception("Error accediendo a database: " + databaseError.getMessage()));
                }
            });

            // Esperar resultado con timeout
            return future.get(10, TimeUnit.SECONDS);

        } catch (Exception e) {
            System.err.println("❌ Error obteniendo rol de usuario: " + e.getMessage());
            throw new Exception("Error obteniendo rol de usuario: " + e.getMessage());
        }
    }

    // ✅ Metodo CORREGIDO para eliminar usuario de Firebase Realtime Database
    public void deleteUserFromRealtimeDatabase(String uid) throws Exception {
        try {
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users").child(uid);

            // Hacer la eliminación síncrona
            CompletableFuture<Void> future = new CompletableFuture<>();

            ref.removeValue(new DatabaseReference.CompletionListener() {
                @Override
                public void onComplete(DatabaseError databaseError, DatabaseReference databaseReference) {
                    if (databaseError != null) {
                        future.completeExceptionally(new Exception("Error eliminando de database: " + databaseError.getMessage()));
                    } else {
                        future.complete(null);
                    }
                }
            });

            // Esperar resultado con timeout
            future.get(10, TimeUnit.SECONDS);

            System.out.println("✅ Usuario eliminado de Realtime Database: " + uid);

        } catch (Exception e) {
            System.err.println("❌ Error eliminando usuario de Firebase Database: " + e.getMessage());
            throw new Exception("Error eliminando usuario de Firebase Database: " + e.getMessage());
        }
    }

    // ✅ Metodo para eliminar usuario de Firebase Authentication - SIN CAMBIOS
    private void deleteUserFromFirebaseAuth(String uid) throws Exception {
        try {
            FirebaseAuth.getInstance().deleteUser(uid);
            System.out.println("✅ Usuario eliminado de Firebase Authentication: " + uid);
        } catch (FirebaseAuthException e) {
            System.err.println("❌ Error eliminando usuario de Firebase Auth: " + e.getMessage());
            throw new Exception("Error eliminando usuario de Firebase Auth: " + e.getMessage());
        }
    }

    public List<User> getAllUsers() throws ExecutionException, InterruptedException {
        CompletableFuture<List<User>> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(USERS_PATH);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                List<User> userList = new ArrayList<>();
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Map<String, Object> userData = (Map<String, Object>) snapshot.getValue();
                    User user = User.fromMap(userData);
                    userList.add(user);
                }
                future.complete(userList);
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future.get();
    }

    public User getUserById(String uid) throws ExecutionException, InterruptedException {
        CompletableFuture<User> future = new CompletableFuture<>();

        DatabaseReference ref = firebaseDatabase.getReference(USERS_PATH).child(uid);
        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Map<String, Object> userData = (Map<String, Object>) dataSnapshot.getValue();
                    User user = User.fromMap(userData);
                    future.complete(user);
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

    public void updateUserRole(String uid, Role role) {
        DatabaseReference userRef = firebaseDatabase.getReference(USERS_PATH).child(uid).child("role");
        userRef.setValue(role.toString(), (error, ref) -> {
            if (error != null) {
                System.err.println("Error al actualizar rol: " + error.getMessage());
            } else {
                System.out.println("Rol actualizado correctamente: " + role);
            }
        });
    }

    public Role verifyUserRole(String idToken) throws ExecutionException, InterruptedException {
        try {
            // Verificar y decodificar el token para obtener el UID
            String uid = FirebaseAuth.getInstance().verifyIdToken(idToken).getUid();

            // Obtener el usuario de Firebase Realtime Database
            User user = findUserByUid(uid);

            if (user != null) {
                System.out.println(user.getRol());
                return user.getRol(); // Retornar el rol del usuario
            } else {
                throw new IllegalArgumentException("El usuario no existe en la base de datos");
            }
        } catch (FirebaseAuthException e) {
            throw new RuntimeException("Error al verificar el token de autenticación", e);
        }
    }

}
