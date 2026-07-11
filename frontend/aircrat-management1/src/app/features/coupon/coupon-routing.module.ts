import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CouponListComponent } from './coupon-list/coupon-list.component';
import { CouponDetailComponent } from './coupon-detail/coupon-detail.component';
import { CouponValidateComponent } from './coupon-validate/coupon-validate.component';
 
const routes: Routes = [
  { path: '',       
       component: CouponListComponent
       },
  { path: 'new',      
     component: CouponDetailComponent
     },
  { path: 'edit/:id',
      component: CouponDetailComponent 
    },
  { path: 'validate',
      component: CouponValidateComponent
     },
];
@NgModule({
   imports: [
    RouterModule.forChild(routes)
   ], 
    exports: [
      RouterModule
    ] })
export class CouponRoutingModule { }
