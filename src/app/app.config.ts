import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouterModule, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule, provideHttpClient, withFetch, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations, BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor'; // Import the interceptor

// Import for angular-calendar
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {

  providers: [
    provideToastr(), 
    provideZoneChangeDetection({ eventCoalescing: true }), // Recommended for Angular v17+
    provideRouter(routes, withViewTransitions()),
    provideClientHydration(),
    provideAnimations(), // Ensures BrowserAnimationsModule is provided
    provideHttpClient(withFetch()), // Use withFetch or remove if not needed, but keep provideHttpClient
    importProvidersFrom(
      RouterModule, 
      // BrowserAnimationsModule, // Already effectively provided by provideAnimations()
      HttpClientModule,
      CalendarModule.forRoot({ // Add CalendarModule with forRoot here
        provide: DateAdapter,
        useFactory: adapterFactory,
      })
    ),
    // Provide the interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};

