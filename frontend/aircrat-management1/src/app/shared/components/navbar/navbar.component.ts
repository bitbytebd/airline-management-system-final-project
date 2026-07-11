import { Component, OnInit } from '@angular/core';

interface ShellNavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;

  primaryLinks: ShellNavItem[] = [
    { label: 'Dashboard', route: '/dashboard/overview', icon: 'fas fa-chart-line' },
    { label: 'Bookings', route: '/booking', icon: 'fas fa-ticket-alt' },
    { label: 'Flights', route: '/flight', icon: 'fas fa-plane-departure' },
    { label: 'Passengers', route: '/passenger', icon: 'fas fa-users' },
    { label: 'Pricing', route: '/pricing', icon: 'fas fa-tags' },
    { label: 'Revenue', route: '/revenue/summary', icon: 'fas fa-chart-area' }
  ];

  settingsLinks: ShellNavItem[] = [
    { label: 'User Management', route: '/users', icon: 'fas fa-user-shield' },
    { label: 'Roles', route: '/users/roles', icon: 'fas fa-user-lock' },
    { label: 'Reports', route: '/report/financial-overview', icon: 'fas fa-file-lines' },
    { label: 'Home Page', route: '/home', icon: 'fas fa-house' }
  ];

  constructor() { }

  ngOnInit(): void { }

  toggleSubmenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
