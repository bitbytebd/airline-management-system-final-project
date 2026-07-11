import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoyaltyListComponent } from './loyalty-list/loyalty-list.component';
import { LoyaltyRedeemComponent } from './loyalty-redeem/loyalty-redeem.component';
import { LoyaltyTiersComponent } from './loyalty-tiers/loyalty-tiers.component';
 
const routes: Routes = [
  { path: '',       
    component: LoyaltyListComponent
   },
  { path: 'redeem',
     component: LoyaltyRedeemComponent 
    },
  { path: 'tiers', 
     component: LoyaltyTiersComponent
     },
];
@NgModule({
   imports: [
    RouterModule.forChild(routes)
  ],
   exports: [
    RouterModule
  ] 
})
export class LoyaltyRoutingModule { }
