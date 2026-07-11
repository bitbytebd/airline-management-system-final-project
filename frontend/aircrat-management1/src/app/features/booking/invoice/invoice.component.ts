import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { BookingService } from 'src/app/core/services/booking.service';
import { Booking } from 'src/app/core/models/booking.model';
import { Payment } from 'src/app/core/models/payment.model';
import { PaymentService } from 'src/app/core/services/payment.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit, OnDestroy {
  booking: Booking | undefined;
  paidPayment: Payment | undefined;

  constructor(
    private route: ActivatedRoute,
    private service: BookingService,
    private paymentService: PaymentService,
    private router: Router,
    private renderer: Renderer2 // ১. Renderer2 inject 
  ) {}

  ngOnInit(): void {
    // when this page is loaded, add a class to the body to hide the sidebar
    this.renderer.addClass(document.body, 'invoice-mode');

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.service.getById(id).subscribe(data => {
        this.booking = data;
        if (data?.id) {
          this.paymentService.getByBookingId(data.id).subscribe(payments => {
            this.paidPayment = (payments || []).find(payment => this.isSuccessfulPayment(payment));
          });
        }
      });
    }
  }

  // when this page is destroyed, remove the class from the body to show the sidebar again
  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'invoice-mode');
  }

  print() {
    window.print();
  }

  goToTicket() {
    if (this.booking) {
      this.router.navigate(['/booking/ticket', this.booking.bookingReference]);
    }
  }
  
  goBack() {
    this.router.navigate(['/booking']); // the list page of bookings
  }

  finalChargedAmount(): number {
    return Number(this.paidPayment?.amount ?? this.paidPayment?.totalAmount ?? this.booking?.totalPrice ?? 0);
  }

  paymentLoyaltyDiscount(): number {
    return Number(this.paidPayment?.loyaltyDiscount ?? this.booking?.loyaltyDiscount ?? 0);
  }

  paymentLoyaltyPointsUsed(): number {
    return Number(this.paidPayment?.loyaltyPointsUsed ?? this.booking?.loyaltyPointsUsed ?? 0);
  }

  private isSuccessfulPayment(payment: Payment): boolean {
    const status = String(payment.status || payment.paymentStatus || '').toUpperCase();
    return ['COMPLETED', 'PAID', 'SUCCESS'].includes(status);
  }
}
