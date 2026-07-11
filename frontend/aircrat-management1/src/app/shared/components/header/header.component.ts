import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserManagementService } from 'src/app/core/services/user-management.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  private readonly apiBaseUrl = 'http://localhost:8080';
  imageLoadFailed = false;
  searchTerm = '';
  showNotifications = false;
  showSearchSuggestions = false;
  showAdminProfiles = false;
  adminProfiles: any[] = [];
  loadingAdmins = false;

  private readonly moduleSuggestions = [
    { label: 'Dashboard', route: '/dashboard', roles: ['ALL'] },
    { label: 'Booking', route: '/booking', roles: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'BOOKING_AGENT', 'AGENT', 'CUSTOMER_SUPPORT'] },
    { label: 'Passenger', route: '/passenger', roles: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'BOOKING_AGENT', 'AGENT', 'CUSTOMER_SUPPORT'] },
    { label: 'Payment', route: '/payment', roles: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'PAYMENT_OFFICER', 'ACCOUNTANT'] },
    { label: 'Flight', route: '/flight', roles: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'FLIGHT_MANAGER'] },
    { label: 'Tracking', route: '/tracking', roles: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'FLIGHT_MANAGER', 'CUSTOMER_SUPPORT'] },
    { label: 'Expense', route: '/expense', roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
    { label: 'Report', route: '/report', roles: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'ACCOUNTANT'] },
    { label: 'Loyalty', route: '/loyalty', roles: ['SUPER_ADMIN', 'ADMIN', 'BOOKING_AGENT', 'AGENT'] },
    { label: 'Coupon', route: '/coupon', roles: ['SUPER_ADMIN', 'ADMIN', 'BOOKING_AGENT', 'AGENT'] },
    { label: 'User Management', route: '/users', roles: ['SUPER_ADMIN', 'ADMIN'] }
  ];

  notifications = [
    { title: 'Pending Payments', detail: 'Review approved bookings awaiting payment' },
    { title: 'Booking Approval Pending', detail: 'Open approval queue for pending reviews' },
    { title: 'Delayed/Active Flights', detail: 'Monitor live tracking and operational updates' }
  ];

  constructor(
    private authService: AuthService,
    private userManagementService: UserManagementService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  get currentUser(): any {
    return this.authService.getCurrentUser() || {};
  }

  get displayName(): string {
    return this.currentUser?.fullName || this.currentUser?.username || 'Skyward User';
  }

  get roleLabel(): string {
    const role = this.currentUser?.role || 'STAFF';
    return String(role).replace(/_/g, ' ');
  }

  get profileImageUrl(): string {
    if (this.imageLoadFailed) return '';
    return this.resolveProfileImage(this.currentUser?.profileImageUrl);
  }

  get canViewAdminProfiles(): boolean {
    return this.authService.hasAnyRole('SUPER_ADMIN', 'ADMIN');
  }

  get filteredSuggestions(): any[] {
    const query = this.searchTerm.trim().toLowerCase();
    if (!query) return [];
    return this.moduleSuggestions
      .filter(item => this.canAccessSuggestion(item.roles))
      .filter(item => item.label.toLowerCase().includes(query));
  }

  onProfileImageError(): void {
    this.imageLoadFailed = true;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showAdminProfiles = false;
    this.showSearchSuggestions = false;
  }

  onSearchFocus(): void {
    this.showSearchSuggestions = !!this.searchTerm.trim();
    this.showNotifications = false;
    this.showAdminProfiles = false;
  }

  onSearchChange(): void {
    this.showSearchSuggestions = !!this.searchTerm.trim();
  }

  navigateSuggestion(item: any): void {
    this.searchTerm = '';
    this.showSearchSuggestions = false;
    this.router.navigate([item.route]);
  }

  toggleAdminProfiles(): void {
    if (!this.canViewAdminProfiles) return;
    this.showAdminProfiles = !this.showAdminProfiles;
    this.showNotifications = false;
    this.showSearchSuggestions = false;

    if (this.showAdminProfiles && !this.adminProfiles.length) {
      this.loadingAdmins = true;
      this.userManagementService.getAll().subscribe({
        next: users => {
          this.adminProfiles = (users || []).filter(user =>
            ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'BOOKING_AGENT', 'AGENT', 'PAYMENT_OFFICER', 'ACCOUNTANT', 'FLIGHT_MANAGER', 'CUSTOMER_SUPPORT', 'STAFF', 'VIEWER']
              .includes(String(user.role || '').toUpperCase())
          );
          this.loadingAdmins = false;
        },
        error: () => {
          this.adminProfiles = [];
          this.loadingAdmins = false;
        }
      });
    }
  }

  resolveUserImage(user: any): string {
    return this.resolveProfileImage(user?.profileImageUrl);
  }

  getInitials(user: any): string {
    const source = user?.fullName || user?.username || 'U';
    return source.split(' ').filter(Boolean).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase();
  }

  private canAccessSuggestion(roles: string[]): boolean {
    return roles.includes('ALL') || this.authService.hasAnyRole(roles);
  }

  private resolveProfileImage(url: string | null | undefined): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || url.startsWith('data:')) {
      return url;
    }
    return `${this.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
}
