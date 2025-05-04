import { Component } from '@angular/core';
import { AuthService } from '../../service/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-pagina-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './pagina-chat.component.html',
  styleUrl: './pagina-chat.component.scss'
})
export class PaginaChatComponent {
  chats: any = [];
  chat: any = [];
  
  constructor(private authService: AuthService, private router: Router, private http: HttpClient, private auth: Auth) { }

    ngOnInit(){
      onAuthStateChanged(this.auth, async (user) => {
        if (user) {
          // Solo obtendremos los chats si estamos autenticados
          this.chats = await this.getChats();
          console.log('Chats obtenidos:', this.chats);
          this.chat = await this.getChatMessages('e128d737-fb46-444f-8445-0aa4acd01e52');
          console.log('Mensajes obtenidos:', this.chat);
        } else {
          console.error('Usuario no autenticado');
        }
      });
    }

  createChat(user2: string) {
    const user1 = this.authService.getCurrentUser();
    const newChat = { user1, user2, /* other chat data */ };
    this.authService.createChat(newChat).then((response) => {
      console.log('Chat creado con ID:', response);
      // Optionally, you can refresh the chat list or navigate to the new chat
      this.authService.getChats().then((chats) => {
        this.chats = chats;
      });
      this.router.navigate(['/chat', response]);
    }).catch((error) => {
      console.error('Error al crear el chat', error);
    });
  }

  async getChats() {
    try {
      const token = await this.authService.getIdToken();
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      console.log('Headers:', headers);
  
      // Realizamos la solicitud HTTP para obtener los chats
      const response = await firstValueFrom(this.http.get<any>('http://localhost:8080/api/chat/listarChats', { headers }));
  
      // Verificamos si la respuesta es un objeto y lo convertimos a un array
      if (response && typeof response === 'object') {
        const chatsArray = Object.values(response); // Convertir el objeto a un array
        console.log('Chats:', chatsArray);
        return chatsArray;
      }
  
      // Si ya es un array, lo retornamos tal cual
      return response || [];
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

}
