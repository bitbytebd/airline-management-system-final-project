import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AircraftRoutingModule } from './aircraft-routing.module';
import { AircraftListComponent } from './aircraft-list/aircraft-list.component';
import { AircraftDetailComponent } from './aircraft-detail/aircraft-detail.component';


@NgModule({
  declarations: [
    AircraftListComponent,
    AircraftDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AircraftRoutingModule
  ]
})
export class AircraftModule { }
