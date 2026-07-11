import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Coupon, emptyCoupon } from 'src/app/core/models/coupon.model';
import { CouponService } from 'src/app/core/services/coupon.service';

@Component({
  selector: 'app-coupon-detail',
  templateUrl: './coupon-detail.component.html',
  styleUrls: ['./coupon-detail.component.css']
})
export class CouponDetailComponent implements OnInit {
  form!: FormGroup;
  id: number | null = null;
  saving = false;
  errorMsg = '';

  cabins = ['ALL', 'ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];
  routes = ['ALL', 'Dhaka to Dubai', 'Dhaka to Bangkok', 'Dhaka to Doha', 'Chattogram to Singapore', 'Sylhet to Kuala Lumpur'];

  constructor(
    private fb: FormBuilder,
    private service: CouponService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const coupon = emptyCoupon();
    this.form = this.fb.group({
      code: [coupon.code, [Validators.required, Validators.maxLength(40)]],
      title: [coupon.title, Validators.required],
      description: [coupon.description],
      discountType: [coupon.discountType, Validators.required],
      discountValue: [coupon.discountValue, [Validators.required, Validators.min(0)]],
      minimumBookingAmount: [coupon.minimumBookingAmount, [Validators.min(0)]],
      maximumDiscountAmount: [coupon.maximumDiscountAmount, [Validators.min(0)]],
      currency: [coupon.currency, Validators.required],
      applicableRoute: [coupon.applicableRoute],
      applicableCabin: [coupon.applicableCabin],
      validFrom: [coupon.validFrom, Validators.required],
      validUntil: [coupon.validUntil, Validators.required],
      usageLimit: [coupon.usageLimit, [Validators.min(0)]],
      usedCount: [coupon.usedCount, [Validators.min(0)]],
      status: [coupon.status, Validators.required]
    });

    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    if (routeId) {
      this.id = routeId;
      this.service.getById(routeId).subscribe({
        next: data => this.form.patchValue(data),
        error: () => this.errorMsg = 'Coupon was not found.'
      });
    }
  }

  save(): void {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.errorMsg = 'Please complete the required coupon fields.';
      return;
    }
    this.saving = true;
    const payload = this.form.value as Coupon;
    const request = this.id ? this.service.update(this.id, payload) : this.service.create(payload);
    request.subscribe({
      next: () => this.router.navigate(['/coupon']),
      error: e => { this.errorMsg = e?.error?.message || 'Unable to save coupon.'; this.saving = false; }
    });
  }

  formatPreview(): string {
    const type = this.form?.get('discountType')?.value;
    const value = this.form?.get('discountValue')?.value || 0;
    return type === 'PERCENTAGE' ? `${value}% off` : `$${Number(value).toFixed(2)} off`;
  }
}
