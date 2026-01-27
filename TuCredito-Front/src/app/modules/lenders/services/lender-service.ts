import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LenderService {

  private readonly API_URL = '/api/lenders';

  constructor(private http: HttpClient) {}

  // 🔐 Registro de prestamista
  register(data: RegisterLenderRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, data);
  }

  // 🔑 Login
  login(data: LoginLenderRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, data);
  }

  // 👤 Obtener datos del prestamista logueado
  getMe(): Observable<Lender> {
    return this.http.get<Lender>(`${this.API_URL}/me`);
  }

  // ✏️ Actualizar datos del prestamista
  updateMe(data: UpdateLenderRequest): Observable<Lender> {
    return this.http.put<Lender>(`${this.API_URL}/me`, data);
  }
}
