import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; 

import { FormsModule } from '@angular/forms'; 
import { BookingRoutingModule } from './booking-routing.module';

import { BookingListComponent } from './booking-list/booking-list.component';
import { BookingDetailComponent } from './booking-detail/booking-detail.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { TicketViewComponent } from './view-ticket/view-ticket.component';

import { SeatSelectionComponent } from './seat-selection/seat-selection.component';
import { TrackBookingComponent } from './track-booking/track-booking.component';
import { BookingApprovalComponent } from './booking-approval/booking-approval.component';

@NgModule({
  declarations: [
    BookingListComponent,
    BookingDetailComponent,
    InvoiceComponent,
    TicketViewComponent,
    SeatSelectionComponent,
    TrackBookingComponent,
    BookingApprovalComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
   FormsModule,
    BookingRoutingModule
  ]
})
export class BookingModule { }
