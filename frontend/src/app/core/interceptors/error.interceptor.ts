import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'A apărut o eroare neașteptată.';

        if (error.error instanceof ErrorEvent) {
          //client-side error
          errorMessage = `Eroare: ${error.error.message}`;
        } else {
          //server-side error
          switch (error.status) {
            case 400:
              if (error.error && error.error.message) {
                errorMessage = error.error.message;
              } else {
                errorMessage = 'Date invalide. Verificați datele introduse.';
              }
              break;
            case 401:
              errorMessage = 'Nu sunteți autorizat. Vă rugăm să vă autentificați.';
              break;
            case 403:
              errorMessage = 'Acces interzis. Nu aveți dreptul de a accesa această resursă.';
              break;
            case 404:
              errorMessage = 'Resursa solicitată nu a fost găsită.';
              break;
            case 409:
              errorMessage = 'Conflict. Operația nu poate fi finalizată.';
              break;
            case 422:
              if (error.error && error.error.message) {
                errorMessage = error.error.message;
              } else {
                errorMessage = 'Validare nereușită. Verificați datele introduse.';
              }
              break;
            case 500:
              errorMessage = 'Eroare de server. Încercați din nou mai târziu.';
              break;
            default:
              errorMessage = `Eroare ${error.status}: ${error.statusText}`;
              break;
          }
        }

        console.error('API Error:', error);

        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
