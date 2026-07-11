// ═══════════════════════════════════════════════════════════════════
// FILE: src/app/core/services/payment.service.ts
// API base: http://localhost:8080/api/payments
// ═══════════════════════════════════════════════════════════════════
import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';

import {
  Payment,
  PaymentStats,
  ProcessExpensePaymentRequest,
  ProcessPaymentRequest
} from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {

  private readonly api = 'http://localhost:8080/api/payments';

  constructor(private http: HttpClient) {}

  //use toGET /api/payments 
  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.api);
  }

  /** GET /api/payments/{id} */
  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.api}/${id}`);
  }

  //use to GET /api/payments/status/{status} 
  getByStatus(status: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.api}/status/${status}`);
  }

  //use to GET /api/payments/method/{method} 
  getByMethod(method: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.api}/method/${method}`);
  }

  //use to GET /api/payments/booking/{bookingId}
  getByBookingId(bookingId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.api}/booking/${bookingId}`);
  }

  //use to GET /api/payments/passenger/{passengerId} 
  getByPassengerId(pid: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.api}/passenger/${pid}`);
  }

  //use to GET /api/payments/search?q=keyword 
  search(q: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.api}/search?q=${encodeURIComponent(q)}`);
  }

  // GET /api/payments/stats 
  getStats(): Observable<PaymentStats> {
    return this.http.get<PaymentStats>(`${this.api}/stats`);
  }

  //use GET /api/payments/monthly-stats 
  getMonthlyStats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/monthly-stats`);
  }

  //use to GET /api/payments/method-breakdown */
  getMethodBreakdown(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/method-breakdown`);
  }

  /** POST /api/payments/process */
  process(data: ProcessPaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.api}/process`, data);
  }

  processExpense(expenseId: number, data: ProcessExpensePaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.api}/process-expense/${expenseId}`, data);
  }

  //use to PATCH /api/payments/{id}/cancel
  cancel(id: number): Observable<Payment> {
    return this.http.patch<Payment>(`${this.api}/${id}/cancel`, {});
  }

  //use to PATCH /api/payments/{id}/mark-refunded 
  markRefunded(id: number): Observable<Payment> {
    return this.http.patch<Payment>(`${this.api}/${id}/mark-refunded`, {});
  }
}
