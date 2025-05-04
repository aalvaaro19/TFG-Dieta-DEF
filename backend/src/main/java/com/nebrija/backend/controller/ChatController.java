package com.nebrija.backend.controller;

import com.nebrija.backend.model.Chat;
import com.nebrija.backend.model.Mensaje;
import com.nebrija.backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ChatController {

    private final ChatService chatService;

    // 🔹 Enviar un mensaje a un chat -> Funciona
    @PostMapping("/enviarMensaje")
    public ResponseEntity<String> sendMessage(@RequestBody Mensaje mensaje) {
        try {
            chatService.sendMessage(mensaje).get(); // Esperar a que se complete el envío del mensaje
            return ResponseEntity.ok("Mensaje enviado al chat " + mensaje.getChatId());
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error al enviar el mensaje", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al enviar el mensaje");
        }
    }

    // 🔹 Obtener mensajes de un chat -> Funciona
    @GetMapping("/listarChat/{chatId}")
    public ResponseEntity<List<Mensaje>> getMessages(@PathVariable String chatId) {
        try {
            // Esperamos a que se resuelva el CompletableFuture
            List<Mensaje> messages = chatService.getMessagesByChatId(chatId).get();  // .get() bloquea el hilo
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            log.error("Error al obtener mensajes del chat", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 🔹 Crear un chat -> Funciona
    @PostMapping("/crearChat")
    public ResponseEntity<Map<String, String>> createChat(@RequestBody Chat chat) {
        try {
            String chatId = chatService.createChat(chat).get(); // Esperar a que se cree el chat
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Chat creado");
            response.put("chatId", chatId);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error al crear el chat", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Error al crear el chat");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // 🔹 Obtener todos los chats -> Funciona
    @GetMapping("/listarChats")
    public ResponseEntity<List<Chat>> getAllChats() {
        try {
            List<Chat> chats = chatService.getAllChats().get(); // Esperar a que se obtengan todos los chats
            return ResponseEntity.ok(chats);
        } catch (InterruptedException | ExecutionException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 🔹 Obtener un chat por su ID
    @GetMapping("/obtenerChat/{chatId}")
    public ResponseEntity<Chat> getChatById(@PathVariable String chatId) {
        try {
            Chat chat = chatService.getChatById(chatId).get(); // Esperar a que se obtenga el chat
            if (chat == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // Si no existe el chat
            }
            return ResponseEntity.ok(chat);
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error al obtener el chat", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // 🔹 Actualizar un mensaje -> Falta comprobacion
    @PutMapping("/actualizarMensaje")
    public ResponseEntity<String> updateMensaje(@RequestBody Mensaje mensaje) {
        try {
            chatService.updateMessage(mensaje).get(); // Esperar a que se actualice el mensaje
            return ResponseEntity.ok("Mensaje actualizado correctamente");
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error al actualizar el mensaje", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al actualizar el mensaje");
        }
    }

    // 🔹 Eliminar un mensaje -> Falta comprobacion
    @DeleteMapping("/eliminarMensaje/{chatId}/{messageId}")
    public ResponseEntity<String> deleteMessage(@PathVariable String chatId, @PathVariable String messageId) {
        try {
            chatService.deleteMessage(chatId, messageId).get(); // Esperar a que se elimine el mensaje
            return ResponseEntity.ok("Mensaje eliminado correctamente");
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error al eliminar el mensaje", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el mensaje");
        }
    }

    // 🔹 Eliminar un chat -> Falta comprobacion
    @DeleteMapping("/eliminarChat/{chatId}")
    public ResponseEntity<String> deleteChat(@PathVariable String chatId) {
        try {
            chatService.deleteChat(chatId).get(); // Esperar a que se elimine el chat
            return ResponseEntity.ok("Chat eliminado correctamente");
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error al eliminar el chat", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error al eliminar el chat");
        }
    }

}
