package com.nebrija.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Chat {
    private String sender;
    private String receiver;
    private String text;
    private String timestamp;
    private boolean read;
    private String chatId; // Identificador único para conversaciones entre dos usuarios
    private List<Mensaje> mensajes;

    public Map<String, Object> toMapChat() {
        Map<String, Object> map = new HashMap<>();
        map.put("sender", sender);
        map.put("receiver", receiver);
        map.put("text", text);
        map.put("timestamp", timestamp);
        map.put("read", read);
        map.put("chatId", chatId);
        map.put("mensajes", mensajes);
        return map;
    }

    public static Chat fromMap(Map<String, Object> map) {
        Chat chat = new Chat();
        chat.setSender((String) map.get("sender"));
        chat.setReceiver((String) map.get("receiver"));
        chat.setText((String) map.get("text"));
        chat.setTimestamp((String) map.get("timestamp"));
        chat.setRead((boolean) map.get("read"));
        chat.setChatId((String) map.get("chatId"));
        chat.setMensajes((List<Mensaje>) map.get("mensajes"));
        return chat;
    }
}
