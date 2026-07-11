import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoyaltyRoutingModule } from './loyalty-routing.module';
import { LoyaltyListComponent } from './loyalty-list/loyalty-list.component';
import { LoyaltyRedeemComponent } from './loyalty-redeem/loyalty-redeem.component';
import { LoyaltyTiersComponent } from './loyalty-tiers/loyalty-tiers.component';


@NgModule({
  declarations: [
    LoyaltyListComponent,
    LoyaltyRedeemComponent,
    LoyaltyTiersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoyaltyRoutingModule
  ]
})
export class LoyaltyModule { }
