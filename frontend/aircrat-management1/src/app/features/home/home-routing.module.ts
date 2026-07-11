import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { UserPortalComponent } from './user-portal/user-portal.component';
import { PublicFlightSearchComponent } from './public-flight-search/public-flight-search.component';
import { PublicBookingComponent } from './public-booking/public-booking.component';
import { PublicPaymentComponent } from './public-payment/public-payment.component';
import { PublicBookingStatusComponent } from './public-booking-status/public-booking-status.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'home', component: HomepageComponent },
  { path: 'user-portal', component: UserPortalComponent },
  { path: 'flights/search', component: PublicFlightSearchComponent },
  { path: 'public-booking', component: PublicBookingComponent },
  { path: 'booking-status', component: PublicBookingStatusComponent },
  { path: 'public-payment', component: PublicPaymentComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
