import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { OverbookingSummary, WaitlistEntry, WaitlistStats } from '../models/waitlist.model';

@Injectable({ providedIn: 'root' })
export class WaitlistService {
  private readonly api = 'http://localhost:8080/api/waitlist';

  constructor(private http: HttpClient) {}

  getAll(status?: string, q?: string): Observable<WaitlistEntry[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (q) params = params.set('q', q);
    return this.http.get<WaitlistEntry[]>(this.api, { params });
  }

  create(entry: WaitlistEntry): Observable<WaitlistEntry> {
    return this.http.post<WaitlistEntry>(this.api, entry);
  }

  update(id: number, entry: WaitlistEntry): Observable<WaitlistEntry> {
    return this.http.put<WaitlistEntry>(`${this.api}/${id}`, entry);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  notify(id: number): Observable<WaitlistEntry> {
    return this.http.patch<WaitlistEntry>(`${this.api}/${id}/notify`, {});
  }

  confirm(id: number): Observable<WaitlistEntry> {
    return this.http.patch<WaitlistEntry>(`${this.api}/${id}/confirm`, {});
  }

  cancel(id: number): Observable<WaitlistEntry> {
    return this.http.patch<WaitlistEntry>(`${this.api}/${id}/cancel`, {});
  }

  getStats(): Observable<WaitlistStats> {
    return this.http.get<WaitlistStats>(`${this.api}/stats`);
  }

  getOverbookingSummary(): Observable<OverbookingSummary[]> {
    return this.http.get<any[]>(`${this.api}/overbooking-summary`).pipe(
      map(rows => (rows || []).map(r => ({
        flightId: Number(r[0] || 0),
        flightNumber: r[1],
        origin: r[2],
        destination: r[3],
        waitlisted: Number(r[4] || 0),
        requestedSeats: Number(r[5] || 0),
        avgPriority: Number(r[6] || 0)
      })))
    );
  }
}
