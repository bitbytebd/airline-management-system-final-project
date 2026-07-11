import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CouponRoutingModule } from './coupon-routing.module';
import { CouponListComponent } from './coupon-list/coupon-list.component';
import { CouponDetailComponent } from './coupon-detail/coupon-detail.component';
import { CouponValidateComponent } from './coupon-validate/coupon-validate.component';


@NgModule({
  declarations: [
    CouponListComponent,
    CouponDetailComponent,
    CouponValidateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CouponRoutingModule
  ]
})
export class CouponModule { }
