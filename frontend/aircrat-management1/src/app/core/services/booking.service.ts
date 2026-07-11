import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';

@Injectable({ 
  providedIn: 'root' })

export class BookingService {
  private apiUrl = 'http://localhost:8080/api/bookings';
 
  constructor(private http: HttpClient) { }

  // Get all bookings in booking section
  getAll(): Observable<Booking[]> {
     return this.http.get<Booking[]>(this.apiUrl); }

     //get booking by status in booking section
  getByStatus(status: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/status/${status}`);
  }

     //method to get booking by reference id
  getById(id: number): Observable<Booking> {
     return this.http.get<Booking>(`${this.apiUrl}/${id}`); }

     // method to get booking by reference number
  getByReference(ref: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/ref/${ref}`);
  }

    // for getting total seatmapping in booking section by specific flight id
    getSeatMap(flightId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/flight/${flightId}/seats`);
  }

   // Track Booking Search by using  passenger name, flight number, or booking reference
  searchBookings(query: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
  }

  // Get Flight Seat Report and show total seat mapping in booking section by specific flight id
  getFlightSeatReport(flightId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/report/${flightId}`);
  }

    // get total seat in table by specific flight id
  getBookingsByFlight(flightId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/flight/${flightId}/list`);
  }

  //create new booking in booking section
  create(data: Booking): Observable<Booking> { 
    return this.http.post<Booking>(this.apiUrl, data); }

    //updaste booking in booking section by specific id
  update(id: number, data: Booking): Observable<Booking> { 
    
       return this.http.put<Booking>(`${this.apiUrl}/${id}`, data); }

       //approve booking in booking section by specific id
  approve(id: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/approve`, {});
  }

  //reject booking in booking section by specific id
  reject(id: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/reject`, {});
  }

  //reopen booking review in booking section by specific id
  reopenReview(id: number): Observable<Booking> {
    return this.http.patch<Booking>(`${this.apiUrl}/${id}/reopen-review`, {});
  }

  //delete booking in booking section by specific id
  delete(id: number): Observable<void> { 
    return this.http.delete<void>(`${this.apiUrl}/${id}`); }
  }
