package com.nebrija.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.database.*;
import com.nebrija.backend.model.enums.Role;
import com.nebrija.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

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

    // Modify createUser in UserService.java
    public void createUser(String email, String password, String nombreUsuario, String nombreCompleto,
                           String telefono, String direccion, double peso, double altura, String sexo) {
        try {
            UserRecord userRecord;

            // Try to get existing user first
            try {
                userRecord = FirebaseAuth.getInstance().getUserByEmail(email);
            } catch (FirebaseAuthException e) {
                // User doesn't exist yet, create them
                UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                        .setEmail(email)
                        .setPassword(password)
                        .setDisplayName(nombreCompleto);

                userRecord = FirebaseAuth.getInstance().createUser(request);
            }

            // Create a User object for Realtime Database
            User user = new User();
            user.setId_usuario(userRecord.getUid());
            user.setNombreUsuario(nombreUsuario);
            user.setNombreCompleto(nombreCompleto);
            user.setTelefono(telefono);
            user.setDireccion(direccion);
            user.setEmail(email);
            user.setPassword(password); // Note: Consider not storing plaintext passwords
            user.setPeso(peso);
            user.setAltura(altura);
            user.setSexo(sexo);
            user.setRol(Role.USER); // Set default role

            // Save the user in Firebase Realtime Database
            service.saveUserToRealtimeDatabase(user);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Metodo para actualizar un usuario en Firebase Auth y en Realtime Database
    public void updateUser(String uid, String nombreUsuario, String nombreCompleto, String telefono, String direccion, double peso, double altura, String sexo) {
        try {
            // 1. Actualizar los datos en Firebase Authentication (si es necesario)
            UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(uid)
                    .setDisplayName(nombreCompleto);

            UserRecord userRecord = FirebaseAuth.getInstance().updateUser(request);

            // 2. Crear un objeto User con los nuevos datos
            User user = new User();
            user.setId_usuario(uid);
            user.setNombreUsuario(nombreUsuario);
            user.setNombreCompleto(nombreCompleto);
            user.setTelefono(telefono);
            user.setDireccion(direccion);
            user.setPeso(peso);
            user.setAltura(altura);
            user.setSexo(sexo);

            // 3. Actualizar los datos en Firebase Realtime Database
            service.updateUserInRealtimeDatabase(user);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // Metodo para eliminar un usuario tanto de Firebase Realtime Database como de Firebase Authentication
    public void deleteUser(String uid) {
        try {
            // Primero, eliminar el usuario de Firebase Realtime Database
            service.deleteUserFromRealtimeDatabase(uid);

            // Luego, eliminar el usuario de Firebase Authentication
            service.deleteUserFromFirebaseAuth(uid);

        } catch (Exception e) {
            e.printStackTrace();
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
