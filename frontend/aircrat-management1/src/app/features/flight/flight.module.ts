import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // must be added
import { FlightRoutingModule } from './flight-routing.module';

import { FlightListComponent } from './flight-list/flight-list.component';
import { FlightDetailComponent } from './flight-detail/flight-detail.component';
import { FlightScheduleComponent } from './flight-schedule/flight-schedule.component';

@NgModule({
  declarations: [
    FlightListComponent,
    FlightDetailComponent,
    FlightScheduleComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    FlightRoutingModule
  ]
})
export class FlightModule { }
