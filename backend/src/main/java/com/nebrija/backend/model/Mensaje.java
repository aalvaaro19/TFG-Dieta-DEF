package com.nebrija.backend.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mensaje {
    private String id_mensaje;
    private String chatId;
    private String sender;
    private String receiver;
    private String content;
    private long timestamp;

    public Map<String, Object> toMapMensaje() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id_mensaje);
        map.put("chatId", chatId);
        map.put("sender", sender);
        map.put("receiver", receiver);
        map.put("content", content);
        map.put("timestamp", timestamp);
        return map;
    }

    public static Mensaje fromMap(Map<String, Object> map) {
        Mensaje mensaje = new Mensaje();
        mensaje.setId_mensaje((String) map.get("id_mensaje"));
        mensaje.setChatId((String) map.get("chatId"));
        mensaje.setSender((String) map.get("sender"));
        mensaje.setReceiver((String) map.get("receiver"));
        mensaje.setContent((String) map.get("content"));
        mensaje.setTimestamp((long) map.get("timestamp"));
        return mensaje;
    }
}
