import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PrestamoDTO, ResumenPrestamoDTO } from '../models/loan.models';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/loans`;

  getAll(): Observable<PrestamoDTO[]> {
    return this.http.get<PrestamoDTO[]>(this.apiUrl);
  }

  getById(id: number): Observable<PrestamoDTO> {
    return this.http.get<PrestamoDTO>(`${this.apiUrl}/${id}`);
  }

  filter(nombre?: string, estado?: number, mesVto?: number, anio?: number): Observable<PrestamoDTO[]> {
    let params = new HttpParams();
    if (nombre) params = params.set('nombre', nombre);
    if (estado) params = params.set('estado', estado);
    if (mesVto) params = params.set('mesVto', mesVto);
    if (anio) params = params.set('anio', anio);

    return this.http.get<PrestamoDTO[]>(`${this.apiUrl}/filter`, { params });
  }

  getSummary(id: number): Observable<ResumenPrestamoDTO> {
    return this.http.get<ResumenPrestamoDTO>(`${this.apiUrl}/${id}/summary`);
  }

  create(prestamo: PrestamoDTO): Observable<any> {
    return this.http.post(this.apiUrl, prestamo);
  }

  archive(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/archive`, {});
  }
}
