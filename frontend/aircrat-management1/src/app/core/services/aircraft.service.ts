import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Aircraft } from '../models/aircraft.model';

@Injectable({
  providedIn: 'root'
})
export class AircraftService {
  private apiUrl = 'http://localhost:8080/api/aircrafts';

  constructor(private http: HttpClient) { }

  getAircrafts(): Observable<Aircraft[]> {
    return this.http.get<Aircraft[]>(this.apiUrl);
  }

  createAircraft(aircraft: Aircraft): Observable<Aircraft> {
    return this.http.post<Aircraft>(this.apiUrl, aircraft);
  }

  updateAircraft(id: number, aircraft: Aircraft): Observable<Aircraft> {
    return this.http.put<Aircraft>(`${this.apiUrl}/${id}`, aircraft);
  }

  deleteAircraft(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}