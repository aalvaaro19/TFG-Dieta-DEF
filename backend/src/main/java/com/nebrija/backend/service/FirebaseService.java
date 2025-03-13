package com.nebrija.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.nebrija.backend.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

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
}
