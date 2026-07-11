import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WaitlistRoutingModule } from './waitlist-routing.module';
import { WaitlistListComponent } from './waitlist-list/waitlist-list.component';
import { WaitlistOverbookingComponent } from './waitlist-overbooking/waitlist-overbooking.component';


@NgModule({
  declarations: [
    WaitlistListComponent,
    WaitlistOverbookingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WaitlistRoutingModule
  ]
})
export class WaitlistModule { }
