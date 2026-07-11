import { Component } from '@angular/core';

interface DashboardTab {
  label: string;
  route: string;
  icon: string;
}

interface DashboardHeroPill {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  heroPills: DashboardHeroPill[] = [
    { label: 'Live Operations', icon: 'fas fa-tower-broadcast' },
    { label: 'Revenue Insight', icon: 'fas fa-chart-line' },
    { label: 'Flight Intelligence', icon: 'fas fa-plane-up' }
  ];

  tabs: DashboardTab[] = [
    { label: 'Admin Overview', route: '/dashboard/overview', icon: 'fas fa-gauge-high' },
    { label: 'Booking & Ticket', route: '/dashboard/booking-ticket', icon: 'fas fa-ticket-alt' },
    { label: 'Expense', route: '/dashboard/expense', icon: 'fas fa-receipt' },
    { label: 'Flight Performance', route: '/dashboard/flight-performance', icon: 'fas fa-plane-departure' },
    { label: 'Tracking Overview', route: '/dashboard/tracking-overview', icon: 'fas fa-satellite-dish' }
  ];
}
