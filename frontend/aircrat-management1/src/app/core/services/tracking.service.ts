import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FlightStatusLog, LiveMapFlight, TrackingAutoCalculateRequest, TrackingUpdateRequest } from '../models/flight-status.model';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private apiUrl = 'http://localhost:8080/tracking';

  constructor(private http: HttpClient) { }

  getAll(): Observable<FlightStatusLog[]> {
    return this.http.get<FlightStatusLog[]>(`${this.apiUrl}/all`);
  }

  getToday(): Observable<FlightStatusLog[]> {
    return this.http.get<FlightStatusLog[]>(`${this.apiUrl}/today`);
  }

  getLive(): Observable<FlightStatusLog[]> {
    return this.http.get<FlightStatusLog[]>(`${this.apiUrl}/live`);
  }

  getLiveMap(): Observable<LiveMapFlight[]> {
    return this.http.get<LiveMapFlight[]>(`${this.apiUrl}/live-map`);
  }

  getPremiumLive(): Observable<LiveMapFlight[]> {
    return this.http.get<LiveMapFlight[]>('http://localhost:8080/api/tracking/premium-live');
  }

  getHybridLive(flightId: number): Observable<LiveMapFlight> {
    return this.http.get<LiveMapFlight>(`http://localhost:8080/api/tracking/hybrid-live/${flightId}`);
  }

  autoCalculate(data: TrackingAutoCalculateRequest): Observable<LiveMapFlight> {
    return this.http.post<LiveMapFlight>('http://localhost:8080/api/tracking/auto-calculate', data);
  }

  getByStatus(status: string): Observable<FlightStatusLog[]> {
    return this.http.get<FlightStatusLog[]>(`${this.apiUrl}/status/${status}`);
  }

  getLatest(flightId: number): Observable<FlightStatusLog> {
    return this.http.get<FlightStatusLog>(`${this.apiUrl}/${flightId}/latest`);
  }

  getHistory(flightId: number): Observable<FlightStatusLog[]> {
    return this.http.get<FlightStatusLog[]>(`${this.apiUrl}/${flightId}/history`);
  }

  fullUpdate(flightId: number, data: TrackingUpdateRequest): Observable<FlightStatusLog> {
    return this.http.post<FlightStatusLog>(`${this.apiUrl}/${flightId}/update`, data);
  }

  quickUpdate(flightId: number, status: string, reason: string): Observable<FlightStatusLog> {
    return this.http.patch<FlightStatusLog>(`${this.apiUrl}/${flightId}/quick`, { status, reason });
  }
}
