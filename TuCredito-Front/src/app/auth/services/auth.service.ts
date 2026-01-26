import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PrestamistaLoginDTO, AuthResponse, Prestamista, PrestamistaRegisterDTO, PrestamistaUpdateDTO } from '../models/auth.models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/lenders`;

  // Signal para el usuario actual
  currentUser = signal<Prestamista | null>(null);

  constructor() {
    // Intentar recuperar el usuario al iniciar si hay token
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.currentUser.set(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user', e);
        this.logout();
      }
    }
  }

  login(credentials: PrestamistaLoginDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  register(data: PrestamistaRegisterDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  updateProfile(data: PrestamistaUpdateDTO): Observable<any> {
    return this.http.put(`${this.apiUrl}/me`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private setSession(authResult: AuthResponse) {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.prestamista));
    this.currentUser.set(authResult.prestamista);
  }

  // Validar token y actualizar datos del usuario
  me(): Observable<Prestamista> {
    return this.http.get<Prestamista>(`${this.apiUrl}/me`).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }
}
