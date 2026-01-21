import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DashboardKpisDTO,
  GraficoDatoDTO,
  SerieTiempoDTO,
} from '../models/dashboard.models';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  getKpis(from?: string, to?: string): Observable<DashboardKpisDTO> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http
      .get<DashboardKpisDTO>(`${this.apiUrl}/kpis`, { params })
      .pipe(catchError(this.handleError));
  }

  getPrestamosPorEstado(): Observable<GraficoDatoDTO[]> {
    return this.http
      .get<GraficoDatoDTO[]>(`${this.apiUrl}/loans-by-status`)
      .pipe(catchError(this.handleError));
  }

  getFlujoCobranzas(from?: string, to?: string): Observable<SerieTiempoDTO[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http
      .get<SerieTiempoDTO[]>(`${this.apiUrl}/monthly-collections`, { params })
      .pipe(catchError(this.handleError));
  }

  getEvolucionSaldo(): Observable<SerieTiempoDTO[]> {
    return this.http
      .get<SerieTiempoDTO[]>(`${this.apiUrl}/balance-evolution`)
      .pipe(catchError(this.handleError));
  }

  getRankingClientesDeuda(): Observable<GraficoDatoDTO[]> {
    return this.http
      .get<GraficoDatoDTO[]>(`${this.apiUrl}/customer-ranking`)
      .pipe(catchError(this.handleError));
  }

  getProyeccionFlujoCaja(): Observable<GraficoDatoDTO[]> {
    return this.http
      .get<GraficoDatoDTO[]>(`${this.apiUrl}/cash-flow-projection`)
      .pipe(catchError(this.handleError));
  }

  getEvolucionColocacion(from?: string, to?: string): Observable<SerieTiempoDTO[]> {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http
      .get<SerieTiempoDTO[]>(`${this.apiUrl}/loans-trend`, { params })
      .pipe(catchError(this.handleError));
  }

  getComposicionRiesgo(): Observable<GraficoDatoDTO[]> {
    return this.http
      .get<GraficoDatoDTO[]>(`${this.apiUrl}/risk-composition`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
