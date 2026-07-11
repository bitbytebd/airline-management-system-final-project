import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeRoutingModule } from './home-routing.module';
import { HomepageComponent } from './homepage/homepage.component';
import { UserPortalComponent } from './user-portal/user-portal.component';
import { PublicFlightSearchComponent } from './public-flight-search/public-flight-search.component';
import { PublicBookingComponent } from './public-booking/public-booking.component';
import { PublicPaymentComponent } from './public-payment/public-payment.component';
import { PublicBookingStatusComponent } from './public-booking-status/public-booking-status.component';

@NgModule({
  declarations: [
    HomepageComponent,
    UserPortalComponent,
    PublicFlightSearchComponent,
    PublicBookingComponent,
    PublicBookingStatusComponent,
    PublicPaymentComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
