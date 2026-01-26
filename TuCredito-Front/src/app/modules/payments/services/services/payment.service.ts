import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PagoInputDTO, PagoOutputDTO } from '../../modules/payments/models/payment.models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  getAll(): Observable<PagoOutputDTO[]> {
    return this.http.get<PagoOutputDTO[]>(this.apiUrl);
  }

  getById(id: number): Observable<PagoOutputDTO> {
    return this.http.get<PagoOutputDTO>(`${this.apiUrl}/${id}`);
  }

  filter(nombre?: string, mes?: number): Observable<PagoOutputDTO[]> {
    let params = new HttpParams();
    if (nombre) params = params.set('nombre', nombre);
    if (mes) params = params.set('mes', mes);
    return this.http.get<PagoOutputDTO[]>(`${this.apiUrl}/filter`, { params });
  }

  create(pago: PagoInputDTO): Observable<any> {
    return this.http.post(this.apiUrl, pago);
  }

  createAdvance(pago: PagoInputDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/advance`, pago);
  }

  updateStatus(id: number, estado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, JSON.stringify(estado), {
        headers: { 'Content-Type': 'application/json' }
    });
  }
}
