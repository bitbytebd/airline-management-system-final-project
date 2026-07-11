import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Observable } from 'rxjs';
import { Expense } from '../models/expense.model';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private apiUrl = 'http://localhost:8080/api/expenses';

  constructor(private http: HttpClient) { }


  getAll(category?: string | null): Observable<Expense[]> {
    let params = new HttpParams();
    
    if (category) {
      params = params.set('category', category);
    }
     return this.http.get<Expense[]>(this.apiUrl, { params });
  }
  getById(id: number): Observable<Expense> { return this.http.get<Expense>(`${this.apiUrl}/${id}`); }
  create(data: Expense): Observable<Expense> { return this.http.post<Expense>(this.apiUrl, data); }
  update(id: number, data: Expense): Observable<Expense> { return this.http.put<Expense>(`${this.apiUrl}/${id}`, data); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }
  getTotal(): Observable<number> { return this.http.get<number>(`${this.apiUrl}/total`); }
}