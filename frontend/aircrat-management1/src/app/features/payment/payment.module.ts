import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
 
import { PaymentRoutingModule }   from './payment-routing.module';
import { PaymentListComponent }   from './payment-list/payment-list.component';
import { PaymentDetailComponent } from './payment-detail/payment-detail.component';
import { PaymentProcessComponent }from './payment-process/payment-process.component';
import { BookingPaymentPendingComponent } from './booking-payment-pending/booking-payment-pending.component';
 
@NgModule({
  declarations: [
    PaymentListComponent,
    PaymentDetailComponent,
    PaymentProcessComponent,
    BookingPaymentPendingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PaymentRoutingModule
  ]
})
export class PaymentModule {}
