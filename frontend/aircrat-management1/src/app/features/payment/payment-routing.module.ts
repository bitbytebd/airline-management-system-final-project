import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
 
import { PaymentListComponent }    from './payment-list/payment-list.component';
import { PaymentDetailComponent }  from './payment-detail/payment-detail.component';
import { PaymentProcessComponent } from './payment-process/payment-process.component';
import { BookingPaymentPendingComponent } from './booking-payment-pending/booking-payment-pending.component';
 
const routes: Routes = [
  { path: '',            component: PaymentListComponent    },  // /payment
  { path: 'booking-pending', component: BookingPaymentPendingComponent },
  { path: 'process',     component: PaymentProcessComponent },  // /payment/process
  { path: 'detail/:id',  component: PaymentDetailComponent  },  // /payment/detail/5
];
 
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentRoutingModule {}
