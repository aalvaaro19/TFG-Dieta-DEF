package com.nebrija.backend.service;

import com.google.api.core.ApiFuture;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.database.*;
import com.nebrija.backend.model.Receta;
import com.nebrija.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
public class FirebaseService {

    private final FirebaseAuth firebaseAuth;
    private final FirebaseDatabase firebaseDatabase = FirebaseDatabase.getInstance();

    public FirebaseToken verifyToken(String idToken) throws FirebaseAuthException {
        return firebaseAuth.verifyIdToken(idToken);
    }

    //Metodo para guardar un usuario en Firebase Realtime Database
    public void saveUserToRealtimeDatabase(User user) {
        DatabaseReference ref = firebaseDatabase.getReference("users").child(user.getId_usuario());
        ref.setValueAsync(user.toMap());
    }

    //Metodo para actualizar un usuario en Firebase Realtime Database
    public void updateUserInRealtimeDatabase(User user) {
        DatabaseReference ref = firebaseDatabase.getReference("users").child(user.getId_usuario());

        // Crear un mapa con solo los campos que deseas actualizar
        Map<String, Object> updates = user.toMap();
        ref.updateChildrenAsync(updates);
    }

    // Metodo para eliminar un usuario de Firebase Realtime Database
    public void deleteUserFromRealtimeDatabase(String uid) {
        DatabaseReference ref = firebaseDatabase.getReference("users").child(uid);
        ref.removeValueAsync(); // Elimina el nodo del usuario
    }

    // Metodo para eliminar un usuario de Firebase Authentication
    public void deleteUserFromFirebaseAuth(String uid) {
        try {
            FirebaseAuth.getInstance().deleteUser(uid); // Elimina al usuario de Firebase Auth
        } catch (Exception e) {
            e.printStackTrace();
        }
    }



    // Metodo para actualizar datos en Firebase
    public void updateData(String path, String id, Map<String, Object> data) {
        DatabaseReference ref = firebaseDatabase.getReference(path).child(id);
        ApiFuture<Void> future = ref.updateChildrenAsync(data);
        try {
            future.get();
            System.out.println("Datos actualizados correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al actualizar datos: " + e.getMessage());
        }
    }

    // Metodo para eliminar datos de Firebase
    public void deleteData(String path, String id) {
        DatabaseReference ref = firebaseDatabase.getReference(path).child(id);
        ApiFuture<Void> future = ref.removeValueAsync();
        try {
            future.get();
            System.out.println("Datos eliminados correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar datos: " + e.getMessage());
        }
    }

    // Metodo para eliminar todos los datos en una ruta de Firebase
    public void deleteAllData(String path) {
        DatabaseReference ref = firebaseDatabase.getReference(path);
        ApiFuture<Void> future = ref.removeValueAsync();
        try {
            future.get();
            System.out.println("Todos los datos eliminados correctamente.");
        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error al eliminar todos los datos: " + e.getMessage());
        }
    }
}
