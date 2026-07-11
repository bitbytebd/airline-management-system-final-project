import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminOverviewDashboardComponent } from './admin-overview-dashboard/admin-overview-dashboard.component';
import { BookingTicketDashboardComponent } from './booking-ticket-dashboard/booking-ticket-dashboard.component';
import { DashboardComponent } from './dashboard.component';
import { ExpenseDashboardComponent } from './expense-dashboard/expense-dashboard.component';
import { FlightPerformanceDashboardComponent } from './flight-performance-dashboard/flight-performance-dashboard.component';
import { TrackingOverviewDashboardComponent } from './tracking-overview-dashboard/tracking-overview-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'overview', component: AdminOverviewDashboardComponent },
      { path: 'booking-ticket', component: BookingTicketDashboardComponent },
      { path: 'expense', component: ExpenseDashboardComponent },
      { path: 'flight-performance', component: FlightPerformanceDashboardComponent },
      { path: 'tracking-overview', component: TrackingOverviewDashboardComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
