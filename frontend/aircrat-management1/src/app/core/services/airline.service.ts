import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Airline } from '../models/airline.model';

@Injectable({
  providedIn: 'root'
})

export class AirlineService {
  private apiUrl = 'http://localhost:8080/api/airlines';

  constructor(private http: HttpClient) { }

  getAll(): Observable<Airline[]> { 
    return this.http.get<Airline[]>(this.apiUrl); }

  getById(id: number): Observable<Airline> {
     return this.http.get<Airline>(`${this.apiUrl}/${id}`); }

  create(data: Airline): Observable<Airline> { 
    return this.http.post<Airline>(this.apiUrl, data); }

  update(id: number, data: Airline): Observable<Airline> {
     return this.http.put<Airline>(`${this.apiUrl}/${id}`, data); }

  delete(id: number): Observable<void> { 
    return this.http.delete<void>(`${this.apiUrl}/${id}`); }
}