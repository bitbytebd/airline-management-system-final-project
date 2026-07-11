// ═══════════════════════════════════════════════════════════════════
// FILE: src/app/core/services/refund.service.ts
// API base: http://localhost:8080/api/refunds
//           (matches existing BookingController pattern /api/bookings)
// ═══════════════════════════════════════════════════════════════════
import { Injectable }    from '@angular/core';
import { HttpClient }    from '@angular/common/http';
import { Observable }    from 'rxjs';

import {
  Refund,
  RefundStats,
  PenaltyPreview,
  InitiateRefundRequest,
  BookingForRefund
} from '../models/refund.model';

@Injectable({ providedIn: 'root' })
export class RefundService {

  private readonly api = 'http://localhost:8080/api/refunds';
  private readonly bookingApi = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  // ── Refund endpoints 

  // GET /api/refunds — all refunds, sorted newest first 
  getAll(): Observable<Refund[]> {
    return this.http.get<Refund[]>(this.api);
  }

  // GET /api/refunds/{id} 
  getById(id: number): Observable<Refund> {
    return this.http.get<Refund>(`${this.api}/${id}`);
  }

  // GET /api/refunds/pending — PENDING only, sorted oldest first 
  getPending(): Observable<Refund[]> {
    return this.http.get<Refund[]>(`${this.api}/pending`);
  }

  /** GET /api/refunds/status/{status} */
  getByStatus(status: string): Observable<Refund[]> {
    return this.http.get<Refund[]>(`${this.api}/status/${status}`);
  }

  /** GET /api/refunds/booking/{bookingId} */
  getByBookingId(bookingId: number): Observable<Refund[]> {
    return this.http.get<Refund[]>(`${this.api}/booking/${bookingId}`);
  }

  /** GET /api/refunds/search?q=keyword */
  search(keyword: string): Observable<Refund[]> {
    return this.http.get<Refund[]>(`${this.api}/search?q=${encodeURIComponent(keyword)}`);
  }

  /** GET /api/refunds/stats — dashboard KPI stats */
  getStats(): Observable<RefundStats> {
    return this.http.get<RefundStats>(`${this.api}/stats`);
  }
 // GET /api/refunds/preview?bookingId=&reason=
   // Returns penalty breakdown before user confirms submission.
 
  getPreview(bookingId: number, reason: string): Observable<PenaltyPreview> {
    return this.http.get<PenaltyPreview>(
      `${this.api}/preview?bookingId=${bookingId}&reason=${reason}`
    );
  }

  /** POST /api/refunds/initiate — create a new refund request */
  initiate(data: InitiateRefundRequest): Observable<Refund> {
    return this.http.post<Refund>(`${this.api}/initiate`, data);
  }

  /** PATCH /api/refunds/{id}/approve */
  approve(id: number): Observable<Refund> {
    return this.http.patch<Refund>(`${this.api}/${id}/approve`, {});
  }

  /** PATCH /api/refunds/{id}/process */
  process(id: number): Observable<Refund> {
    return this.http.patch<Refund>(`${this.api}/${id}/process`, {});
  }

  /** PATCH /api/refunds/{id}/reject */
  reject(id: number): Observable<Refund> {
    return this.http.patch<Refund>(`${this.api}/${id}/reject`, {});
  }

 //booking lookup

 
   // GET /api/bookings/ref/{ref}
    //finds up a booking by reference for the initiate form.
   
  getBookingByRef(ref: string): Observable<BookingForRefund> {
    return this.http.get<BookingForRefund>(`${this.bookingApi}/ref/${ref}`);
  }

  
//get api...GET / api/bookings/search?q=keyword
// Search bookings by passenger name/email/phone.
   
  searchBookings(q: string): Observable<BookingForRefund[]> {
    return this.http.get<BookingForRefund[]>(
      `${this.bookingApi}/search?q=${encodeURIComponent(q)}`
    );
  }
}