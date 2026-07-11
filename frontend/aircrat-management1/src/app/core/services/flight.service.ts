import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Flight } from '../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private apiUrl = 'http://localhost:8080/api/flights';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Flight[]> {
    return this.http.get<Flight[]>(this.apiUrl);
  }

  getById(id: number): Observable<Flight> {
    return this.http.get<Flight>(`${this.apiUrl}/${id}`);
  }

  create(data: Flight): Observable<Flight> {
    return this.http.post<Flight>(this.apiUrl, data);
  }

  update(id: number, data: Flight): Observable<Flight> {
    return this.http.put<Flight>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

    // Airport List from Backend
  getAirports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/airports`);
  }
  
}