import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Prestatario, PrestatarioDTO } from '../models/borrower.models';

@Injectable({
  providedIn: 'root'
})
export class BorrowerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/borrowers`;

  create(prestatario: Prestatario): Observable<Prestatario> {
    return this.http.post<Prestatario>(this.apiUrl, prestatario);
  }

  getByDni(dni: number): Observable<PrestatarioDTO> {
    return this.http.get<PrestatarioDTO>(`${this.apiUrl}/${dni}`);
  }

  getAll(filtro?: PrestatarioDTO): Observable<PrestatarioDTO[]> {
    let params = new HttpParams();
    if (filtro) {
      Object.keys(filtro).forEach(key => {
        const value = (filtro as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }
    return this.http.get<PrestatarioDTO[]>(this.apiUrl, { params });
  }

  update(dni: number, prestatario: Prestatario): Observable<any> {
    return this.http.put(`${this.apiUrl}/${dni}`, prestatario);
  }

  changeStatus(dni: number, activo: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${dni}/status`, null, {
      params: { activo: activo.toString() }
    });
  }
}
