import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaggageSupportRoutingModule } from './baggage-support-routing.module';
import { BaggageSupportDeskComponent } from './baggage-support-desk/baggage-support-desk.component';

@NgModule({
  declarations: [BaggageSupportDeskComponent],
  imports: [CommonModule, FormsModule, BaggageSupportRoutingModule]
})
export class BaggageSupportModule {}
