import { Component } from '@angular/core';
import { CouponValidationResult } from 'src/app/core/models/coupon.model';
import { CouponService } from 'src/app/core/services/coupon.service';

@Component({
  selector: 'app-coupon-validate',
  templateUrl: './coupon-validate.component.html',
  styleUrls: ['./coupon-validate.component.css']
})
export class CouponValidateComponent {
  code = '';
  amount = 450;
  route = 'ALL';
  cabin = 'ALL';
  checking = false;
  result: CouponValidationResult | null = null;

  routes = ['ALL', 'Dhaka to Dubai', 'Dhaka to Bangkok', 'Dhaka to Doha', 'Chattogram to Singapore', 'Sylhet to Kuala Lumpur'];
  cabins = ['ALL', 'ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];

  constructor(private service: CouponService) {}

  validate(): void {
    if (!this.code.trim()) return;
    this.checking = true;
    this.service.validate(this.code, this.amount, this.route, this.cabin).subscribe({
      next: result => { this.result = result; this.checking = false; },
      error: () => { this.result = { valid: false, message: 'Validation service is unavailable.', discountAmount: 0, finalAmount: this.amount }; this.checking = false; }
    });
  }

  formatMoney(n: number | undefined): string {
    return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
