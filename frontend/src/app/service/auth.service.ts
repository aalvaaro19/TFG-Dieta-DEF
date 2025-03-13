import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup, signOut, UserCredential } from '@angular/fire/auth';
import { collection, doc, Firestore, getDoc, getDocs, setDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private refreshTokenTimer: any;
  public currentUser = new BehaviorSubject<any>(null);

  constructor(private auth: Auth, private firestore: Firestore) {
    // Observador para mantener la información del usuario actualizada
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUser.next(user);
        this.startTokenRefreshTimer();
      } else {
        this.currentUser.next(null);
        this.stopTokenRefreshTimer();
      }
    });
   }

  async loginWithEmailAndPassword(email: string, password: string): Promise<UserCredential | null> {
    try {
      return await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Error al autenticar el usuario:', error);
      return null;
    }
  }

  async loginWithGoogle(): Promise<UserCredential | null> {
    try {
      return await signInWithPopup(this.auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Error al autenticar el usuario con Google:', error);
      return null;
    }
  }

  async logOut() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  // Obtener un token fresco, útil para interceptores HTTP
  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    try {
      // Forzar la actualización del token
      return await user.getIdToken(true);
    } catch (error) {
      console.error('Error al obtener token:', error);
      return null;
    }
  }

  // Iniciar un temporizador para refrescar el token
  private startTokenRefreshTimer() {
    this.stopTokenRefreshTimer();
    
    // Refrescar el token cada 45 minutos (los tokens suelen durar 1 hora)
    this.refreshTokenTimer = setInterval(async () => {
      try {
        const token = await this.getIdToken();
        console.log('Token refrescado automáticamente');
      } catch (error) {
        console.error('Error al refrescar token:', error);
      }
    }, 45 * 60 * 1000);
  }

  private stopTokenRefreshTimer() {
    if (this.refreshTokenTimer) {
      clearInterval(this.refreshTokenTimer);
      this.refreshTokenTimer = null;
    }
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    return userCredential;
  }

  async saveUserData(uid: string, userData: any) {
    await setDoc(doc(this.firestore, 'users', uid), userData);
  }

  async getUserData(uid: string) {
    const userRef = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userRef);
  
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.log('No se encontraron datos del usuario.');
      return null;
    }
  }

  async getAllDataUsers() {
    const usersRef = collection(this.firestore, 'users');
    const usersSnap = await getDocs(usersRef);
    const users = usersSnap.docs.map(doc => doc.data());
    return users;
  }
}
