import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getAnalytics, provideAnalytics, ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()), 
    provideFirebaseApp(() => initializeApp({ 
      projectId: "tfg-daw-87b65", 
      appId: "1:621919919249:web:2e70518528fd73e6293330", 
      databaseURL: "https://tfg-daw-87b65-default-rtdb.europe-west1.firebasedatabase.app", 
      storageBucket: "tfg-daw-87b65.firebasestorage.app", 
      apiKey: "AIzaSyBTXlUBtKHuMQaLgX6l7-wSPCpooxswtwE", 
      authDomain: "tfg-daw-87b65.firebaseapp.com", 
      messagingSenderId: "621919919249", 
      measurementId: "G-PS19230944" })), 
      provideAuth(() => getAuth()), 
      provideAnalytics(() => getAnalytics()), 
      ScreenTrackingService, 
      UserTrackingService, 
      provideFirestore(() => getFirestore()), 
      provideDatabase(() => getDatabase()),
      provideHttpClient(withFetch())
    ]
};
