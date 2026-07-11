import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

export interface SearchItem {
  name: string;
  shortId: string;
  route: string;
  icon: string;
  permissions?: string[];
  roles?: string[];
}

export interface SidebarModule {
  name: string;
  key: string;
  icon: string;
  items: SearchItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  activeMenu: string = '';
  
  // === New Variables for Collapse & User ===
  isCollapsed: boolean = false;
  currentUser: any = null;
  fallbackUser: any = { fullName: 'Mousumi Akter', role: 'ADMIN' };

  // Search Variables
  searchText: string = '';
  filteredItems: SearchItem[] = [];
  showSearchResults: boolean = false;

  private readonly roleModuleAccess: Record<string, string[]> = {
    ADMIN_MANAGER: ['dashboard', 'airline', 'aircraft', 'flight', 'passenger', 'booking', 'payment', 'boarding-pass', 'tracking', 'report'],
    MANAGER: ['dashboard', 'airline', 'aircraft', 'flight', 'passenger', 'booking', 'payment', 'boarding-pass', 'tracking', 'report'],
    BOOKING_AGENT: ['dashboard', 'passenger', 'booking', 'coupon', 'loyalty', 'boarding-pass'],
    AGENT: ['dashboard', 'passenger', 'booking', 'coupon', 'loyalty', 'boarding-pass'],
    PAYMENT_OFFICER: ['dashboard', 'payment'],
    ACCOUNTANT: ['dashboard', 'payment', 'expense', 'report'],
    FLIGHT_MANAGER: ['dashboard', 'airline', 'aircraft', 'flight', 'tracking', 'boarding-pass'],
    CUSTOMER_SUPPORT: ['dashboard', 'passenger', 'booking', 'baggage-support', 'special-assistance', 'tracking'],
    STAFF: ['dashboard'],
    VIEWER: ['dashboard']
  };

  menuModules: SidebarModule[] = [
    { name: 'Aircraft', key: 'aircraft', icon: 'fas fa-plane-up', items: [
      { name: 'Add Aircraft', shortId: 'air1', route: '/aircraft/new', icon: 'fas fa-plus-circle' },
      { name: 'Aircraft List', shortId: 'air2', route: '/aircraft', icon: 'fas fa-list-ul' }
    ]},
    { name: 'Airline', key: 'airline', icon: 'fas fa-building', items: [
      { name: 'Add Airline', shortId: 'arl1', route: '/airline/new', icon: 'fas fa-plus-circle' },
      { name: 'Airline List', shortId: 'arl2', route: '/airline', icon: 'fas fa-list-ul' }
    ]},
    { name: 'Booking', key: 'booking', icon: 'fas fa-ticket-alt', items: [
      { name: 'Add Booking', shortId: 'bok1', route: '/booking/new', icon: 'fas fa-calendar-plus', roles: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'BOOKING_AGENT', 'AGENT'] },
      { name: 'Booking Approval', shortId: 'bok4', route: '/booking/approval', icon: 'fas fa-user-check', permissions: ['BOOKING_APPROVE'], roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
      { name: 'Booking List', shortId: 'bok2', route: '/booking', icon: 'fas fa-list-alt', roles: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'BOOKING_AGENT', 'AGENT', 'CUSTOMER_SUPPORT'] },
      { name: 'Track Booking', shortId: 'bok3', route: '/booking/track', icon: 'fas fa-search-location', roles: ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'BOOKING_AGENT', 'AGENT', 'CUSTOMER_SUPPORT'] }
    ]},
    { name: 'Boarding Pass', key: 'boarding-pass', icon: 'fas fa-qrcode', items: [
      { name: 'Boarding Pass Desk', shortId: 'brd1', route: '/boarding-pass', icon: 'fas fa-id-card' }
    ]},
    { name: 'Baggage Support', key: 'baggage-support', icon: 'fas fa-suitcase-rolling', items: [
      { name: 'Baggage Desk', shortId: 'bag1', route: '/baggage-support', icon: 'fas fa-headset' },
      { name: 'Open Support Cases', shortId: 'bag2', route: '/baggage-support/open-cases', icon: 'fas fa-clipboard-list' }
    ]},
    { name: 'Coupon', key: 'coupon', icon: 'fas fa-tags', items: [
      { name: 'All Coupons', shortId: 'cup1', route: '/coupon', icon: 'fas fa-list-ul' },
      { name: 'Create Coupon', shortId: 'cup2', route: '/coupon/new', icon: 'fas fa-plus' },
      { name: 'Validate Coupon', shortId: 'cup3', route: '/coupon/validate', icon: 'fas fa-check-circle' }
    ]},
    { name: 'Dashboard', key: 'dashboard', icon: 'fas fa-tachometer-alt', items: [
      { name: 'Dashboard Overview', shortId: 'dash1', route: '/dashboard/overview', icon: 'fas fa-chart-line' }
    ]},
    { name: 'Expense', key: 'expense', icon: 'fas fa-money-bill-wave', items: [
      { name: 'Add Expense', shortId: 'exp0', route: '/expense/new', icon: 'fas fa-plus-circle' },
      { name: 'All Expenses', shortId: 'exp1', route: '/expense', icon: 'fas fa-receipt' },
      { name: 'Categories', shortId: 'exp2', route: '/expense/category', icon: 'fas fa-folder-open' }
    ]},
    { name: 'Flight', key: 'flight', icon: 'fas fa-plane-departure', items: [
      { name: 'Add Flight', shortId: 'fly1', route: '/flight/new', icon: 'fas fa-plus-circle' },
      { name: 'Flight List', shortId: 'fly2', route: '/flight', icon: 'fas fa-plane' },
      { name: 'Flight Schedule', shortId: 'fly3', route: '/flight/schedule', icon: 'fas fa-calendar-alt' }
    ]},
    { name: 'Loyalty', key: 'loyalty', icon: 'fas fa-star', items: [
      { name: 'Loyalty Accounts', shortId: 'loy1', route: '/loyalty', icon: 'fas fa-trophy' },
      { name: 'Redeem Points', shortId: 'loy2', route: '/loyalty/redeem', icon: 'fas fa-gift' },
      { name: 'Tiers', shortId: 'loy3', route: '/loyalty/tiers', icon: 'fas fa-crown' }
    ]},
    { name: 'Passenger', key: 'passenger', icon: 'fas fa-users', items: [
      { name: 'Add Passenger', shortId: 'pas1', route: '/passenger/new', icon: 'fas fa-user-plus' },
      { name: 'Passenger List', shortId: 'pas2', route: '/passenger', icon: 'fas fa-users-cog' }
    ]},
    { name: 'Payment', key: 'payment', icon: 'fas fa-credit-card', items: [
      { name: 'Booking Payment Pending', shortId: 'pay4', route: '/payment/booking-pending', icon: 'fas fa-hourglass-half', permissions: ['PAYMENT_RECEIVE'], roles: ['SUPER_ADMIN', 'ADMIN', 'PAYMENT_OFFICER'] },
      { name: 'Payment Detail', shortId: 'pay1', route: '/payment', icon: 'fas fa-receipt' },
      { name: 'Payment Ledger', shortId: 'pay2', route: '/payment', icon: 'fas fa-list-ul' },
      { name: 'Process Payment', shortId: 'pay3', route: '/payment/process', icon: 'fas fa-lock' }
    ]},
    { name: 'Pricing', key: 'pricing', icon: 'fas fa-bolt', items: [
      { name: 'Price Simulator', shortId: 'pri1', route: '/pricing/simulator', icon: 'fas fa-calculator' },
      { name: 'Pricing Rules', shortId: 'pri2', route: '/pricing', icon: 'fas fa-list-ul' }
    ]},
    { name: 'Refund', key: 'refund', icon: 'fas fa-undo-alt', items: [
      { name: 'All Refunds', shortId: 'ref1', route: '/refund', icon: 'fas fa-list-ul' },
      { name: 'Initiate Refund', shortId: 'ref2', route: '/refund/initiate', icon: 'fas fa-plus-circle' },
      { name: 'Pending Refunds', shortId: 'ref3', route: '/refund/pending', icon: 'fas fa-clock' }
    ]},
    { name: 'Report', key: 'report', icon: 'fas fa-chart-pie', items: [
      { name: 'Expense Report', shortId: 'rep1', route: '/report/expense', icon: 'fas fa-file-invoice-dollar' },
      { name: 'Financial Overview', shortId: 'rep2', route: '/report/financial-overview', icon: 'fas fa-chart-line' },
      { name: 'Flight Seat Report', shortId: 'rep3', route: '/report/flight-seat', icon: 'fas fa-chair' },
      { name: 'Sales Report', shortId: 'rep4', route: '/report/sales', icon: 'fas fa-dollar-sign' }
    ]},
    { name: 'Revenue', key: 'revenue', icon: 'fas fa-chart-area', items: [
      { name: 'Forecast', shortId: 'rev1', route: '/revenue/forecast', icon: 'fas fa-chart-line' },
      { name: 'KPI Summary', shortId: 'rev2', route: '/revenue/summary', icon: 'fas fa-gauge-high' },
      { name: 'Profit / Loss', shortId: 'rev3', route: '/revenue/profit-loss', icon: 'fas fa-balance-scale' }
    ]},
    { name: 'Special Assistance', key: 'special-assistance', icon: 'fas fa-hands-helping', items: [
      { name: 'Assistance Desk', shortId: 'ast1', route: '/special-assistance', icon: 'fas fa-wheelchair' },
      { name: 'Service Requests', shortId: 'ast2', route: '/special-assistance/requests', icon: 'fas fa-notes-medical' }
    ]},
    { name: 'Tracking', key: 'tracking', icon: 'fas fa-satellite-dish', items: [
      { name: 'Flight Status', shortId: 'trk1', route: '/tracking/status', icon: 'fas fa-info-circle' },
      { name: 'Live Tracking', shortId: 'trk2', route: '/tracking', icon: 'fas fa-broadcast-tower' },
      { name: 'Update Status', shortId: 'trk3', route: '/tracking/update', icon: 'fas fa-edit' }
    ]},
    { name: 'User Management', key: 'user-management', icon: 'fas fa-user-shield', items: [
      { name: 'All Users', shortId: 'usr1', route: '/users', icon: 'fas fa-list-ul' },
      { name: 'Roles', shortId: 'usr2', route: '/users/roles', icon: 'fas fa-user-lock' }
    ]},
    { name: 'Waitlist', key: 'waitlist', icon: 'fas fa-hourglass-half', items: [
      { name: 'Overbooking', shortId: 'wl1', route: '/waitlist/overbooking', icon: 'fas fa-exclamation-triangle' },
      { name: 'Queue', shortId: 'wl2', route: '/waitlist', icon: 'fas fa-list-ul' }
    ]}
  ].sort((a, b) => {
    const presentationOrder: Record<string, number> = {
      'dashboard': 1,
      'airline': 2,
      'aircraft': 3,
      'flight': 4,
      'passenger': 5,
      'booking': 6,
      'coupon': 7,
      'loyalty': 8,
      'payment': 9,
      'boarding-pass': 10,
      'tracking': 11,
      'expense': 12,
      'report': 13,
      'refund': 14,
      'special-assistance': 15,
      'baggage-support': 16,
      'user-management': 17,
      'pricing': 18,
      'revenue': 19,
      'waitlist': 20
    };
    return (presentationOrder[a.key] ?? 99) - (presentationOrder[b.key] ?? 99);
  });

  visibleMenuModules: SidebarModule[] = [];
  allMenuItems: SearchItem[] = [];

  constructor(private router: Router, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser() || this.fallbackUser;
    this.visibleMenuModules = this.menuModules
      .filter(module => this.canShowModule(module.key))
      .map(module => ({
        ...module,
        items: module.items.filter(item => this.canShowItem(item))
      }))
      .filter(module => module.items.length > 0);
    this.allMenuItems = this.visibleMenuModules.flatMap(module => module.items);
  }

  toggleMenu(menuName: string) {
    if (this.isCollapsed) return; // Don't toggle if sidebar is collapsed
    this.activeMenu = this.activeMenu === menuName ? '' : menuName;
  }

  // === New Method: Toggle Sidebar Collapse ===
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.activeMenu = ''; // Close menus when collapsing
      this.searchText = '';
      this.showSearchResults = false;
    }
  }

  // Search Logic
  filterMenu() {
    if (!this.searchText) {
      this.filteredItems = [];
      this.showSearchResults = false;
      return;
    }
    const query = this.searchText.toLowerCase();
    this.filteredItems = this.allMenuItems.filter(item => 
      item.name.toLowerCase().includes(query) || 
      item.shortId.toLowerCase().includes(query)
    );
    this.showSearchResults = true;
  }

  navigateTo(route: string) {
    this.searchText = '';
    this.filteredItems = [];
    this.showSearchResults = false;
    this.router.navigate([route]);
  }

  onBlurEvent() {
    setTimeout(() => { this.showSearchResults = false; }, 200);
  }

  logout() {
    this.authService.logout();
  }

  private canShowModule(key: string): boolean {
    if (!this.authService.isLoggedIn()) return false;

    const role = this.authService.getRole();
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;

    const allowedModules = this.roleModuleAccess[role] || ['dashboard'];
    return allowedModules.includes(key);
  }

  private canShowItem(item: SearchItem): boolean {
    const permissionAllowed = !item.permissions?.length ||
      this.authService.hasAnyPermission(...item.permissions);
    const roleAllowed = !item.roles?.length ||
      this.authService.hasAnyRole(...item.roles);

    if (item.permissions?.length && item.roles?.length) {
      return permissionAllowed || roleAllowed;
    }

    return permissionAllowed && roleAllowed;
  }
}
