import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OtpRequest, OtpResponse, OtpVerifyRequest, PortalAccessRequest, UserPortalDashboard } from '../models/user-portal.model';

@Injectable({ providedIn: 'root' })
export class UserPortalService {
  private apiUrl = 'http://localhost:8080/api/user-portal';

  constructor(private http: HttpClient) {}

  sendOtp(payload: OtpRequest): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.apiUrl}/send-otp`, payload);
  }

  verifyOtp(payload: OtpVerifyRequest): Observable<UserPortalDashboard> {
    return this.http.post<UserPortalDashboard>(`${this.apiUrl}/verify-otp`, payload);
  }

  accessDashboard(payload: PortalAccessRequest): Observable<UserPortalDashboard> {
    return this.http.post<UserPortalDashboard>(`${this.apiUrl}/access`, payload);
  }
}
