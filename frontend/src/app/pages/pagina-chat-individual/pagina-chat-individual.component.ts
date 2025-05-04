import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagina-chat-individual',
  imports: [CommonModule],
  templateUrl: './pagina-chat-individual.component.html',
  styleUrl: './pagina-chat-individual.component.scss'
})
export class PaginaChatIndividualComponent {
  messagesData: any[] = [];
  chats: any = [];
  allMessages: any = [];
  
  constructor(private authService: AuthService, private router: Router, private http: HttpClient, private auth: Auth) { }

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        // Solo obtendremos los chats si estamos autenticados
        this.chats = await this.getChats();
        console.log('Chats obtenidos:', this.chats);
        
        // Iterar sobre cada chat y obtener sus mensajes
        for (const chat of this.chats) {
          console.log('Chat:', chat.chatId);
          const chatMessages = await this.getChatMessages(chat.chatId);
          console.log('Mensajes obtenidos para el chat', chat.chatId, chatMessages);

          const receiverData = await this.getDataReceiver(chat.receiver);
          console.log('Datos del receptor:', receiverData.nombreUsuario);
          
          // Guardamos los mensajes de cada chat junto con sus datos
          this.allMessages.push({
            chatId: chat.chatId,
            messages: chatMessages,
            receiver: receiverData
          });
        }
      } else {
        console.error('Usuario no autenticado');
      }
    });
  }

    async getChats(){
      try{
        const token = await this.authService.getIdToken();
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        console.log('Headers:', headers);
  
        // Realizamos la solicitud HTTP para obtener los chats
        return await firstValueFrom(this.http.get<any[]>('http://localhost:8080/api/chat/listarChats', { headers }));
      } catch (error) {
        const errorMessage = (error as any).message || error;
        console.error('Error al obtener los chats:', errorMessage);
        return [];
      }
    }

  async getChatMessages(chatId: string) {
    try{
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      // Realizamos la solicitud HTTP para obtener los mensajes del chat
      const response = await firstValueFrom(this.http.get<any>(`http://localhost:8080/api/chat/listarChat/${chatId}`, { headers }));

      // Verificamos si la respuesta es un objeto y lo convertimos a un array
      if (response && typeof response === 'object') {
        const messagesArray = Object.values(response); // Convertir el objeto a un array
        console.log('Mensajes:', messagesArray);
        return messagesArray;
      }
      // Si ya es un array, lo retornamos tal cual
      return response || [];
    } catch (error) {
      const errorMessage = (error as any).message || error;
      console.error('Error al obtener los mensajes del chat:', errorMessage);
      return [];
    }
  }

  async getDataReceiver(receiverId: string): Promise<any> {
    try {
      // Obtener el token de autenticación
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      // Realizamos la solicitud HTTP para obtener los datos del receptor
      const userData = await firstValueFrom(this.http.get<any>(`http://localhost:8080/api/users/profile/${receiverId}`, { headers }));

      return userData;
    } catch (error) {
      const errorMessage = (error as any).message || error;
      console.error('Error al obtener los datos del receptor:', errorMessage);
      return {};
    }
  }

  async enviarMensaje() {
    try {
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      const chatData = {
        chatId: 'a909231d-8178-4595-8779-a4743ba5c67a',
        sender: 'gTqZTXAz8ChCXn5Sg5XQBCAulw43',
        receiver: 'dLu5BrURVzXR3pfIEdpnswdhhut1',
        read: false,
        content: 'Bien hijo, que tal el tuyo?',
        timestamp: new Date().getTime()
      };
  
      // Realizamos la solicitud HTTP para enviar un mensaje
      const response = await firstValueFrom(this.http.post<string>('http://localhost:8080/api/chat/enviarMensaje', chatData, {
        headers,
        responseType: 'text' as 'json' // Indicar que esperamos un texto, no un JSON
      }));
  
      console.log('Respuesta del servidor:', response); // Ahora 'response' será un String
  
    } catch (error: any) {
      console.error('Error al enviar el mensaje:', error.message || error);
    }
  }
}
