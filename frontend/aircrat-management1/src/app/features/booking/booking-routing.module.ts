import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BookingListComponent } from './booking-list/booking-list.component';
import { BookingDetailComponent } from './booking-detail/booking-detail.component';
import { InvoiceComponent } from './invoice/invoice.component';
import { TicketViewComponent } from './view-ticket/view-ticket.component'; 
import { TrackBookingComponent } from './track-booking/track-booking.component';
import { BookingApprovalComponent } from './booking-approval/booking-approval.component';

const routes: Routes = [
  { path: '', component: BookingListComponent },
  { path: 'approval', component: BookingApprovalComponent },
  { path: 'new', component: BookingDetailComponent },
  { path: 'edit/:id', component: BookingDetailComponent },
  { path: 'ticket/:ref', component: TicketViewComponent },
  { path: 'invoice/:id', component: InvoiceComponent },
  { path: 'track', component: TrackBookingComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BookingRoutingModule { }
