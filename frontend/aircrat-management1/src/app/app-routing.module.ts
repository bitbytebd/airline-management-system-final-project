import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const ALL_STAFF_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'BOOKING_AGENT', 'AGENT', 'PAYMENT_OFFICER', 'ACCOUNTANT', 'FLIGHT_MANAGER', 'CUSTOMER_SUPPORT', 'STAFF', 'VIEWER'];
const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];
const BOOKING_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'BOOKING_AGENT', 'AGENT', 'CUSTOMER_SUPPORT'];
const PASSENGER_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'BOOKING_AGENT', 'AGENT', 'CUSTOMER_SUPPORT'];
const PAYMENT_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'PAYMENT_OFFICER', 'ACCOUNTANT'];
const FLIGHT_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'FLIGHT_MANAGER'];
const BOARDING_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'BOOKING_AGENT', 'AGENT', 'FLIGHT_MANAGER'];
const REPORT_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'ACCOUNTANT'];
const TRACKING_ROLES = ['SUPER_ADMIN', 'ADMIN', 'ADMIN_MANAGER', 'MANAGER', 'FLIGHT_MANAGER', 'CUSTOMER_SUPPORT'];
const SUPPORT_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SUPPORT'];

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/home/home.module').then(m => m.HomeModule)
  },

   // ── Auth (Public - no guard) ──────────────────────────────────
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
 
  // ── Dashboard ─────────────────────────────────────────────────
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [AuthGuard],
    data: { roles: ALL_STAFF_ROLES }
  },
 
  // ── Aircraft ──────────────────────────────────────────────────
  {
    path: 'aircraft',
    loadChildren: () =>
      import('./features/aircraft/aircraft.module').then(m => m.AircraftModule),
    canActivate: [AuthGuard],
    data: { roles: FLIGHT_ROLES }
  },
 
  // ── Airline ───────────────────────────────────────────────────
  {
    path: 'airline',
    loadChildren: () =>
      import('./features/airline/airline.module').then(m => m.AirlineModule),
    canActivate: [AuthGuard],
    data: { roles: FLIGHT_ROLES }
  },
 
  // ── Flight ────────────────────────────────────────────────────
  {
    path: 'flight',
    loadChildren: () =>
      import('./features/flight/flight.module').then(m => m.FlightModule),
    canActivate: [AuthGuard],
    data: { roles: FLIGHT_ROLES }
  },
 
  // ── Booking ───────────────────────────────────────────────────
  {
    path: 'booking',
    loadChildren: () =>
      import('./features/booking/booking.module').then(m => m.BookingModule),
    canActivate: [AuthGuard],
    data: { roles: BOOKING_ROLES }
  },

  {
    path: 'boarding-pass',
    loadChildren: () =>
      import('./features/boarding-pass/boarding-pass.module').then(m => m.BoardingPassModule),
    canActivate: [AuthGuard],
    data: { roles: BOARDING_ROLES }
  },

  {
    path: 'baggage-support',
    loadChildren: () =>
      import('./features/baggage-support/baggage-support.module').then(m => m.BaggageSupportModule),
    canActivate: [AuthGuard],
    data: { roles: SUPPORT_ROLES }
  },
 
  // ── Passenger ─────────────────────────────────────────────────
  {
    path: 'passenger',
    loadChildren: () =>
      import('./features/passenger/passenger.module').then(m => m.PassengerModule),
    canActivate: [AuthGuard],
    data: { roles: PASSENGER_ROLES }
  },
 
  // ── Expense ───────────────────────────────────────────────────
  {
    path: 'expense',
    loadChildren: () =>
      import('./features/expense/expense.module').then(m => m.ExpenseModule),
    canActivate: [AuthGuard],
    data: { roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] }
  },
 
  // ── Reports ───────────────────────────────────────────────────
  {
    path: 'report',
    loadChildren: () =>
      import('./features/report/report.module').then(m => m.ReportModule),
    canActivate: [AuthGuard],
    data: { roles: REPORT_ROLES }
  },
 
    // ── NEW Modules ───────────────────────────────────────────────
  {
    path: 'tracking',
    loadChildren: () => import('./features/tracking/tracking.module').then(m => m.TrackingModule),
    canActivate: [AuthGuard],
    data: { roles: TRACKING_ROLES }
  },
  {
    path: 'flight-tracker',
    loadChildren: () => import('./features/tracking/public-flight-tracker/public-flight-tracker.module').then(m => m.PublicFlightTrackerModule)
  },
  {
    path: 'pricing',
    loadChildren: () => import('./features/pricing/pricing.module').then(m => m.PricingModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ADMIN_ROLES }
  },
  {
    path: 'loyalty',
    loadChildren: () => import('./features/loyalty/loyalty.module').then(m => m.LoyaltyModule),
    canActivate: [AuthGuard],
    data: { roles: ['SUPER_ADMIN', 'ADMIN', 'BOOKING_AGENT', 'AGENT'] }
  },

   {
    path: 'payment',
    loadChildren: () => import('./features/payment/payment.module').then(m => m.PaymentModule),
    canActivate: [AuthGuard],
    data: { roles: PAYMENT_ROLES }
  },

  {
    path: 'revenue',
    loadChildren: () => import('./features/revenue/revenue.module').then(m => m.RevenueModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ADMIN_ROLES }
  },
  {
    path: 'waitlist',
    loadChildren: () => import('./features/waitlist/waitlist.module').then(m => m.WaitlistModule),
    canActivate: [AuthGuard],
    data: { roles: ADMIN_ROLES }
  },
  {
    path: 'coupon',
    loadChildren: () => import('./features/coupon/coupon.module').then(m => m.CouponModule),
    canActivate: [AuthGuard],
    data: { roles: ['SUPER_ADMIN', 'ADMIN', 'BOOKING_AGENT', 'AGENT'] }
  },
  {
    path: 'refund',
    loadChildren: () => import('./features/refund/refund.module').then(m => m.RefundModule),
    canActivate: [AuthGuard],
    data: { roles: ADMIN_ROLES }
  },
  {
    path: 'special-assistance',
    loadChildren: () => import('./features/special-assistance/special-assistance.module').then(m => m.SpecialAssistanceModule),
    canActivate: [AuthGuard],
    data: { roles: SUPPORT_ROLES }
  },
  {
    path: 'users',
    loadChildren: () => import('./features/user-management/user-management.module').then(m => m.UserManagementModule),
    canActivate: [AuthGuard],
    data: { roles: ALL_STAFF_ROLES }
  },

  { path: '**', redirectTo: '' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
