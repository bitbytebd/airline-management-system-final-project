import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PricingRoutingModule } from './pricing-routing.module';
import { PricingListComponent } from './pricing-list/pricing-list.component';
import { PricingDetailComponent } from './pricing-detail/pricing-detail.component';
import { PricingSimulatorComponent } from './pricing-simulator/pricing-simulator.component';
 
@NgModule({
  declarations: [
    PricingListComponent,
     PricingDetailComponent,
      PricingSimulatorComponent
    ],
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule,
     PricingRoutingModule]
})
export class PricingModule { }
