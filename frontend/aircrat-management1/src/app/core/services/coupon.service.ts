import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon, CouponStats, CouponValidationResult } from '../models/coupon.model';

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly api = 'http://localhost:8080/api/coupons';

  constructor(private http: HttpClient) {}

  getAll(status?: string, q?: string): Observable<Coupon[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (q) params = params.set('q', q);
    return this.http.get<Coupon[]>(this.api, { params });
  }

  getById(id: number): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.api}/${id}`);
  }

  create(coupon: Coupon): Observable<Coupon> {
    return this.http.post<Coupon>(this.api, coupon);
  }

  update(id: number, coupon: Coupon): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.api}/${id}`, coupon);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  validate(code: string, amount: number, route: string, cabin: string): Observable<CouponValidationResult> {
    const params = new HttpParams()
      .set('code', code)
      .set('amount', amount)
      .set('route', route || 'ALL')
      .set('cabin', cabin || 'ALL');
    return this.http.get<CouponValidationResult>(`${this.api}/validate`, { params });
  }

  getStats(): Observable<CouponStats> {
    return this.http.get<CouponStats>(`${this.api}/stats`);
  }
}
