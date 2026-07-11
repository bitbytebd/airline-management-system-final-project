import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PassengerService } from 'src/app/core/services/passenger.service';
import { Passenger } from 'src/app/core/models/passenger.model';
import { BookingService } from 'src/app/core/services/booking.service';
import { PaymentService } from 'src/app/core/services/payment.service';
import { RefundService } from 'src/app/core/services/refund.service';
import { LoyaltyService } from 'src/app/core/services/loyalty.service';
import { Booking } from 'src/app/core/models/booking.model';

@Component({
  selector: 'app-passenger-detail',
  templateUrl: './passenger-detail.component.html',
  styleUrls: ['./passenger-detail.component.css']
})
export class PassengerDetailComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id: number | null = null;
  passengerBookings: Booking[] = [];
  passengerPayments: any[] = [];
  passengerRefunds: any[] = [];
  loyaltyAccount: any = null;
  loyaltyTransactions: any[] = [];

  constructor(
    private fb: FormBuilder,
    private passengerService: PassengerService,
    private bookingService: BookingService,
    private paymentService: PaymentService,
    private refundService: RefundService,
    private loyaltyService: LoyaltyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Form Initialization with Validation
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      passportNumber: ['', Validators.required],
      nationality: [''],
      dateOfBirth: [''],
      gender: ['Male'],
      email: ['', Validators.email],
      phoneNumber: [''],
      address: [''],
      frequentFlyerNo: [''],
      mealPreference: ['Standard'],
      status: ['Active']
    });

    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.isEdit = true;
      this.passengerService.getPassengerById(this.id).subscribe({
        next: (data) => {
          this.form.patchValue(data);
          this.loadPassengerTimeline(data);
        },
        error: (err: any) => console.error('Failed to fetch passenger', err)
      });
    }
  }

  loadPassengerTimeline(passenger: Passenger) {
    const passengerId = passenger.id;
    if (!passengerId) return;

    this.bookingService.getAll().subscribe({
      next: (bookings) => {
        this.passengerBookings = bookings.filter(b =>
          b.passengerId === passengerId ||
          (!!passenger.email && b.email === passenger.email) ||
          (!!passenger.phoneNumber && b.phone === passenger.phoneNumber)
        );
      },
      error: () => this.passengerBookings = []
    });

    this.paymentService.getByPassengerId(passengerId).subscribe({
      next: (payments) => this.passengerPayments = payments,
      error: () => this.passengerPayments = []
    });

    const searchKey = `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim() || passenger.email || '';
    if (searchKey) {
      this.refundService.search(searchKey).subscribe({
        next: (refunds) => this.passengerRefunds = refunds.filter(r =>
          r.passengerId === passengerId ||
          r.passengerEmail === passenger.email ||
          r.passengerName?.toLowerCase() === searchKey.toLowerCase()
        ),
        error: () => this.passengerRefunds = []
      });
    }

    this.loyaltyService.getByPassengerId(passengerId).subscribe({
      next: (account) => {
        this.loyaltyAccount = account;
        this.loyaltyService.getTransactions(account.id).subscribe({
          next: (tx) => this.loyaltyTransactions = tx,
          error: () => this.loyaltyTransactions = []
        });
      },
      error: () => {
        this.loyaltyAccount = null;
        this.loyaltyTransactions = [];
      }
    });
  }

  get totalSpent(): number {
    return this.passengerPayments
      .filter(p => ['COMPLETED', 'PAID'].includes((p.status || '').toUpperCase()))
      .reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);
  }

  onSubmit() {
    // Debugging: Check if button is clicked
    console.log('Submit Button Clicked');
    
    if (this.form.invalid) {
      console.log('Form is Invalid');
      // Mark all fields as touched to show errors
      this.form.markAllAsTouched(); 
      return;
    }

    const formData: Passenger = this.form.value;
    console.log('Form Data:', formData);

    if (this.isEdit && this.id) {
      this.passengerService.updatePassenger(this.id, formData).subscribe({
        next: (res) => {
          console.log('Update Success', res);
          alert('Passenger Updated Successfully!');
          this.router.navigate(['/passenger']);
        },
        error: (err: any) => {
          console.error('Update Failed', err);
          alert('Error updating passenger.');
        }
      });
    } else {
      this.passengerService.createPassenger(formData).subscribe({
        next: (res) => {
          console.log('Create Success', res);
          alert('Passenger Saved Successfully!');
          this.router.navigate(['/passenger']);
        },
        error: (err: any) => {
          console.error('Create Failed', err);
          alert('Error saving passenger.');
        }
      });
    }
  }

  onCancel() {
    this.router.navigate(['/passenger']);
  }
}
