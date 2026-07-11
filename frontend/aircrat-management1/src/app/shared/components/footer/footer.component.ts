import { Component, OnInit } from '@angular/core';

interface FooterLink {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  quickLinks: FooterLink[] = [
    { label: 'Aircraft', route: '/aircraft', icon: 'fas fa-plane-up' },
    { label: 'Airline', route: '/airline', icon: 'fas fa-building' },
    { label: 'Booking', route: '/booking', icon: 'fas fa-ticket-alt' },
    { label: 'Coupon', route: '/coupon', icon: 'fas fa-tags' },
    { label: 'Dashboard', route: '/dashboard/overview', icon: 'fas fa-chart-line' },
    { label: 'Expense', route: '/expense', icon: 'fas fa-receipt' },
    { label: 'Flight', route: '/flight', icon: 'fas fa-plane-departure' },
    { label: 'Loyalty', route: '/loyalty', icon: 'fas fa-star' },
    { label: 'Passenger', route: '/passenger', icon: 'fas fa-users' },
    { label: 'Payment', route: '/payment', icon: 'fas fa-credit-card' },
    { label: 'Pricing', route: '/pricing', icon: 'fas fa-bolt' },
    { label: 'Refund', route: '/refund', icon: 'fas fa-rotate-left' },
    { label: 'Report', route: '/report/financial-overview', icon: 'fas fa-chart-pie' },
    { label: 'Revenue', route: '/revenue/summary', icon: 'fas fa-chart-area' },
    { label: 'Tracking', route: '/tracking', icon: 'fas fa-satellite-dish' },
    { label: 'User Management', route: '/users', icon: 'fas fa-user-shield' },
    { label: 'Waitlist', route: '/waitlist', icon: 'fas fa-hourglass-half' }
  ];

  constructor() { }

  ngOnInit(): void { }
}
