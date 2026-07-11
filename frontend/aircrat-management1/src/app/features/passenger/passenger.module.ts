import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { PassengerRoutingModule } from './passenger-routing.module';
import { PassengerListComponent } from './passenger-list/passenger-list.component';
import { PassengerDetailComponent } from './passenger-detail/passenger-detail.component';

@NgModule({
  declarations: [PassengerListComponent, PassengerDetailComponent],
  imports: [CommonModule, ReactiveFormsModule, PassengerRoutingModule]
})
export class PassengerModule { }