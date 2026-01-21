import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SimulacionPrestamoEntryDTO, SimulacionPrestamoOutputDTO } from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/calculator`;

  simulateLoan(entry: SimulacionPrestamoEntryDTO): Observable<SimulacionPrestamoOutputDTO> {
    return this.http.post<SimulacionPrestamoOutputDTO>(`${this.apiUrl}/simulate`, entry)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error al simular el préstamo.';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
