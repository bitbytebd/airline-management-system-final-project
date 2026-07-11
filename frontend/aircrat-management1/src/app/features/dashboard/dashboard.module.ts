import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AdminOverviewDashboardComponent } from './admin-overview-dashboard/admin-overview-dashboard.component';
import { BookingTicketDashboardComponent } from './booking-ticket-dashboard/booking-ticket-dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ExpenseDashboardComponent } from './expense-dashboard/expense-dashboard.component';
import { FlightPerformanceDashboardComponent } from './flight-performance-dashboard/flight-performance-dashboard.component';
import { TrackingOverviewDashboardComponent } from './tracking-overview-dashboard/tracking-overview-dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AdminOverviewDashboardComponent,
    BookingTicketDashboardComponent,
    ExpenseDashboardComponent,
    FlightPerformanceDashboardComponent,
    TrackingOverviewDashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
