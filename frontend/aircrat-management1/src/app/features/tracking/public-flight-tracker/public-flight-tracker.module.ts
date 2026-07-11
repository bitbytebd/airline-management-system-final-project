import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicFlightTrackerRoutingModule } from './public-flight-tracker-routing.module';
import { PublicFlightTrackerComponent } from './public-flight-tracker.component';

@NgModule({
  declarations: [PublicFlightTrackerComponent],
  imports: [
    CommonModule,
    FormsModule,
    PublicFlightTrackerRoutingModule
  ]
})
export class PublicFlightTrackerModule { }
