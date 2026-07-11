import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
 
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
 
  //constructor to inject HttpClient and Router for making API calls and navigating after logout
  constructor(private http: HttpClient, private router: Router) {}
 
  //login method to authenticate user and store token, user info, role, and permissions in localStorage
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        const backendUser = res?.user || {};
        const role = this.normalizeRole(backendUser.role || res?.role);
        const permissions = this.resolvePermissions(role, res.permissions);
        const currentUser = {
          id: backendUser.id ?? res?.id,
          employeeCode: backendUser.employeeCode ?? res?.employeeCode,
          username: backendUser.username || res?.username || username,
          fullName: backendUser.fullName || res?.fullName || res?.name || backendUser.username || res?.username || username,
          role,
          email: backendUser.email || res?.email,
          phoneNumber: backendUser.phoneNumber || res?.phoneNumber,
          department: backendUser.department || res?.department,
          station: backendUser.station || res?.station,
          status: backendUser.status || res?.status,
          profileImageUrl: backendUser.profileImageUrl || res?.profileImageUrl,
          permissions
        };

        if (res?.token) {
          localStorage.setItem('token', res.token);
        }
        localStorage.setItem('user', JSON.stringify(currentUser));
        localStorage.setItem('role', role);
        localStorage.setItem('permissions', JSON.stringify(permissions));
      })
    );
  }
 
  //logout method to clear localStorage and navigate to login page
  logout(): void {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
 
  //is LoginedIn method to check if user is authenticated by checking presence of token in localStorage
  isLoggedIn(): boolean { return !!localStorage.getItem('token') || !!this.getCurrentUser(); }
 
  //getToken method to retrieve the authentication token from localStorage
  getToken(): string | null { return localStorage.getItem('token'); }
 
  //get CurrentUser method to retrieve the current user's information from localStorage
  getCurrentUser(): any {
    const u = localStorage.getItem('user');
    if (!u) return null;
    try {
      return JSON.parse(u);
    } catch {
      return null;
    }
  }
 
  getCurrentUserRole(): string { return this.getRole(); }

  //get Role method to retrieve the current user's role from localStorage or user info
  getRole(): string { return this.normalizeRole(this.getCurrentUser()?.role || localStorage.getItem('role') || ''); }
 
  //hasrole method to check if the current user has a specific role
  hasRole(role: string): boolean { return this.getRole() === this.normalizeRole(role); }
 
  //hasanyRole method to check if the current user has any of the specified roles
  hasAnyRole(...roles: any[]): boolean {
    const roleList = Array.isArray(roles[0]) ? roles[0] : roles;
    const currentRole = this.getRole();
    return roleList.map((role: string) => this.normalizeRole(role)).includes(currentRole);
  }

  //getpermissions method to retrieve the current user's permissions from localStorage or resolve them based on role
  getPermissions(): string[] {
    const stored = localStorage.getItem('permissions');
    if (stored) {
      try { return JSON.parse(stored) || []; } catch { return []; }
    }
    const userPermissions = this.getCurrentUser()?.permissions;
    return Array.isArray(userPermissions) ? userPermissions : this.resolvePermissions(this.getRole(), []);
  }

  hasPermission(permission: string): boolean {
    const permissions = this.getPermissions();
    return permissions.includes('ALL') || permissions.includes(permission);
  }

  hasAnyPermission(...permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  isSuperAdmin(): boolean {
    return this.hasAnyRole('SUPER_ADMIN', 'ADMIN') || this.hasPermission('ALL');
  }
 
  changePassword(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/change-password`, body);
  }

  private normalizeRole(role: string): string {
    return (role || '').toString().trim().toUpperCase();
  }

  private resolvePermissions(role: string, permissions: any): string[] {
    if (Array.isArray(permissions) && permissions.length) {
      return permissions.map(p => String(p).trim().toUpperCase()).filter(Boolean);
    }

    switch (this.normalizeRole(role)) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
        return ['ALL'];
      case 'ADMIN_MANAGER':
      case 'MANAGER':
        return ['BOOKING_VIEW', 'BOOKING_APPROVE', 'BOOKING_REJECT', 'PAYMENT_VIEW', 'REPORT_VIEW'];
      case 'BOOKING_AGENT':
      case 'AGENT':
        return ['BOOKING_CREATE', 'BOOKING_VIEW', 'PASSENGER_VIEW'];
      case 'PAYMENT_OFFICER':
        return ['BOOKING_VIEW', 'PAYMENT_VIEW', 'PAYMENT_RECEIVE', 'INVOICE_VIEW', 'TICKET_ISSUE'];
      case 'ACCOUNTANT':
        return ['EXPENSE_CREATE', 'EXPENSE_VIEW', 'PAYMENT_VIEW', 'PAYMENT_RECEIVE', 'REPORT_VIEW'];
      case 'FLIGHT_MANAGER':
        return ['FLIGHT_MANAGE'];
      case 'CUSTOMER_SUPPORT':
      case 'STAFF':
        return ['PASSENGER_VIEW', 'BOOKING_VIEW'];
      case 'VIEWER':
        return ['REPORT_VIEW'];
      default:
        return [];
    }
  }
}
