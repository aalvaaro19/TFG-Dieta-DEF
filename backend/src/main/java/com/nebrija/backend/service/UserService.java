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

    // Metodo para eliminar un usuario
    public void deleteUser(String uid, String idToken) throws Exception {
        try {
            // Verificar el token de ID para obtener el UID del usuario autenticado
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String authUid = decodedToken.getUid();

            // Obtener el rol del usuario autenticado desde la base de datos
            String userRole = String.valueOf(verifyUserRole(authUid));  // Lógica para obtener el rol desde Firebase Database

            // Si el usuario es ADMIN, puede eliminar a cualquier usuario
            if ("ADMIN".equals(userRole)) {
                deleteUserFromRealtimeDatabase(uid);  // Lógica para eliminar usuario de Firebase Realtime Database
                deleteUserFromFirebaseAuth(uid);  // Lógica para eliminar usuario de Firebase Authentication
            }

            // Si el usuario es USER, solo puede eliminar su propio usuario
            else if (authUid.equals(uid)) {
                deleteUserFromRealtimeDatabase(uid);  // Eliminar su propio usuario
                deleteUserFromFirebaseAuth(uid);  // Eliminar su propio usuario de Firebase Authentication
            } else {
                throw new Exception("No tienes permisos para eliminar este usuario.");
            }

        } catch (FirebaseAuthException e) {
            throw new Exception("Error al verificar el token: " + e.getMessage());
        }
    }

    // ✅ Metodo para eliminar usuario de Firebase Realtime Database
    public void deleteUserFromRealtimeDatabase(String uid) throws Exception {
        try {
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users").child(uid);
            System.out.println("Usuario eliminado de Realtime Database: " + uid);
        } catch (Exception e) {
            throw new Exception("Error eliminando usuario de Firebase Database: " + e.getMessage());
        }
    }

    // ✅ Metodo para eliminar usuario de Firebase Authentication
    private void deleteUserFromFirebaseAuth(String uid) throws Exception {
        try {
            FirebaseAuth.getInstance().deleteUser(uid);
            System.out.println("Usuario eliminado de Firebase Authentication: " + uid);
        } catch (FirebaseAuthException e) {
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
