import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Passenger } from '../models/passenger.model';

@Injectable({
  providedIn: 'root'
})
export class PassengerService {
  private apiUrl = 'http://localhost:8080/api/passengers';

  constructor(private http: HttpClient) { }

  //get all passengers 
  getPassengers(): Observable<Passenger[]> {
    return this.http.get<Passenger[]>(this.apiUrl);
  }

  // get passenger by id
  getPassengerById(id: number): Observable<Passenger> {
    return this.http.get<Passenger>(`${this.apiUrl}/${id}`);
  }

  //get passenger by passport number
  createPassenger(passenger: Passenger): Observable<Passenger> {
    return this.http.post<Passenger>(this.apiUrl, passenger);
  }

  // update passenger
  updatePassenger(id: number, passenger: Passenger): Observable<Passenger> {
    return this.http.put<Passenger>(`${this.apiUrl}/${id}`, passenger);
  }

  // delete passenger
  deletePassenger(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

