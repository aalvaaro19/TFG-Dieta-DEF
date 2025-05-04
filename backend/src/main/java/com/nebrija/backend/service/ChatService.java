package com.nebrija.backend.service;

import com.google.firebase.database.*;
import com.nebrija.backend.model.Chat;
import com.nebrija.backend.model.Mensaje;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class ChatService {

    private final DatabaseReference databaseReference;

    public ChatService() {
        this.databaseReference = FirebaseDatabase.getInstance().getReference("chats");
    }

    // 🔹 Metodo para enviar un mensaje a un chat específico
    public CompletableFuture<Void> sendMessage(Mensaje mensaje) {
        if (mensaje.getChatId() == null || mensaje.getChatId().isEmpty()) {
            throw new IllegalArgumentException("chatId es obligatorio");
        }

        String messageId = UUID.randomUUID().toString(); // Genera un ID único
        mensaje.setId_mensaje(messageId);

        return CompletableFuture.runAsync(() -> {
            databaseReference.child(mensaje.getChatId()).child("messages").child(messageId)
                    .setValueAsync(mensaje.toMapMensaje());
        });
    }

    // 🔹 Obtener mensajes de un chat específico
    public CompletableFuture<List<Mensaje>> getMessagesByChatId(String chatId) {
        if (chatId == null || chatId.isEmpty()) {
            throw new IllegalArgumentException("chatId es obligatorio");
        }

        CompletableFuture<List<Mensaje>> future = new CompletableFuture<>();
        List<Mensaje> messages = new ArrayList<>();

        databaseReference.child(chatId).child("messages").addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Mensaje message = snapshot.getValue(Mensaje.class);
                    messages.add(message);
                }
                future.complete(messages); // Completar la tarea
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException()); // Manejar error
            }
        });

        return future;
    }

    // 🔹 Crear un nuevo chat
    public CompletableFuture<String> createChat(Chat chat) {
        if (chat == null || chat.getSender() == null || chat.getReceiver() == null) {
            throw new IllegalArgumentException("Sender y Receiver son obligatorios");
        }

        String chatId = UUID.randomUUID().toString();
        chat.setChatId(chatId);

        return CompletableFuture.runAsync(() -> {
            databaseReference.child(chatId).setValueAsync(chat);
        }).thenApply(v -> chatId);  // Retorna el chatId generado
    }

    // 🔹 Obtener todos los chats
    public CompletableFuture<List<Chat>> getAllChats() {
        CompletableFuture<List<Chat>> future = new CompletableFuture<>();
        List<Chat> chats = new ArrayList<>();

        databaseReference.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                for (DataSnapshot snapshot : dataSnapshot.getChildren()) {
                    Chat chat = snapshot.getValue(Chat.class);
                    chats.add(chat);
                }
                future.complete(chats); // Completar la tarea
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException()); // Manejar error
            }
        });

        return future;
    }

    // 🔹 Metodo para actualizar un chat
    public CompletableFuture<Void> updateChat(Chat chat) {
        if (chat == null || chat.getChatId() == null || chat.getChatId().isEmpty()) {
            throw new IllegalArgumentException("chatId es obligatorio");
        }

        return CompletableFuture.runAsync(() -> {
            databaseReference.child(chat.getChatId()).setValueAsync(chat);
        });
    }

    // 🔹 Metodo para eliminar un chat
    public CompletableFuture<Void> deleteChat(String chatId) {
        if (chatId == null || chatId.isEmpty()) {
            throw new IllegalArgumentException("chatId es obligatorio");
        }

        return CompletableFuture.runAsync(() -> {
            databaseReference.child(chatId).removeValueAsync();
        });
    }

    // 🔹 Metodo para eliminar un mensaje
    public CompletableFuture<Void> deleteMessage(String chatId, String messageId) {
        if (chatId == null || chatId.isEmpty()) {
            throw new IllegalArgumentException("chatId es obligatorio");
        }
        if (messageId == null || messageId.isEmpty()) {
            throw new IllegalArgumentException("messageId es obligatorio");
        }

        return CompletableFuture.runAsync(() -> {
            databaseReference.child(chatId).child("messages").child(messageId)
                    .removeValueAsync();
        });
    }

    // 🔹 Metodo para actualizar un mensaje
    public CompletableFuture<Void> updateMessage(Mensaje mensaje) {
        if (mensaje.getChatId() == null || mensaje.getChatId().isEmpty()) {
            throw new IllegalArgumentException("chatId es obligatorio");
        }

        if (mensaje.getId_mensaje() == null || mensaje.getId_mensaje().isEmpty()) {
            throw new IllegalArgumentException("messageId es obligatorio");
        }

        return CompletableFuture.runAsync(() -> {
            databaseReference.child(mensaje.getChatId()).child("messages").child(mensaje.getId_mensaje())
                    .setValueAsync(mensaje.toMapMensaje());
        });
    }

    // 🔹 Metodo para obtener un chat por su ID
    public CompletableFuture<Chat> getChatById(String chatId) {
        if (chatId == null || chatId.isEmpty()) {
            throw new IllegalArgumentException("chatId es obligatorio");
        }

        CompletableFuture<Chat> future = new CompletableFuture<>();

        databaseReference.child(chatId).addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot dataSnapshot) {
                if (dataSnapshot.exists()) {
                    Chat chat = dataSnapshot.getValue(Chat.class);
                    future.complete(chat);
                } else {
                    future.completeExceptionally(new IllegalArgumentException("Chat no encontrado"));
                }
            }

            @Override
            public void onCancelled(DatabaseError databaseError) {
                future.completeExceptionally(databaseError.toException());
            }
        });

        return future;
    }
}
