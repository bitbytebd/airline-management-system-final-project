import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Coupon, CouponStats, CouponStatus } from 'src/app/core/models/coupon.model';
import { CouponService } from 'src/app/core/services/coupon.service';

@Component({
  selector: 'app-coupon-list',
  templateUrl: './coupon-list.component.html',
  styleUrls: ['./coupon-list.component.css']
})
export class CouponListComponent implements OnInit {
  coupons: Coupon[] = [];
  stats: CouponStats = { totalCoupons: 0, activeCoupons: 0, totalRedemptions: 0, expiringSoon: 0 };
  loading = true;
  q = '';
  status: '' | CouponStatus = '';

  constructor(private service: CouponService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getAll(this.status, this.q).subscribe({
      next: data => { this.coupons = data || []; this.loading = false; },
      error: () => { this.coupons = []; this.loading = false; }
    });
    this.service.getStats().subscribe({ next: s => this.stats = s });
  }

  edit(coupon: Coupon): void {
    this.router.navigate(['/coupon/edit', coupon.id]);
  }

  remove(coupon: Coupon): void {
    if (!coupon.id || !confirm(`Delete coupon ${coupon.code}?`)) return;
    this.service.delete(coupon.id).subscribe(() => this.load());
  }

  usagePercent(coupon: Coupon): number {
    if (!coupon.usageLimit) return 0;
    return Math.min(100, Math.round((coupon.usedCount / coupon.usageLimit) * 100));
  }

  formatDiscount(coupon: Coupon): string {
    return coupon.discountType === 'PERCENTAGE'
      ? `${coupon.discountValue}%`
      : this.formatMoney(coupon.discountValue, coupon.currency);
  }

  formatMoney(amount: number | undefined, currency = 'USD'): string {
    const prefix = currency === 'USD' ? '$' : `${currency} `;
    return prefix + (amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
