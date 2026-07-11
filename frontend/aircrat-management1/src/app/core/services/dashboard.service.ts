import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private baseUrl = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  getSummary(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/summary`);
  }

  getSalesChart(period: string): Observable<number[]> {
    const params = new HttpParams().set('period', period);
    return this.http.get<number[]>(`${this.baseUrl}/sales-chart`, { params });
  }

  getExpenseChart(period: string): Observable<number[]> {
    const params = new HttpParams().set('period', period);
    return this.http.get<number[]>(`${this.baseUrl}/expense-chart`, { params });
  }
}