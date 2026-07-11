import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 

import { AirlineRoutingModule } from './airline-routing.module';
import { AirlineListComponent } from './airline-list/airline-list.component';
import { AirlineDetailComponent } from './airline-detail/airline-detail.component';

@NgModule({
  declarations: [
    AirlineListComponent,
    AirlineDetailComponent
  ],
  imports: [
    CommonModule,
    AirlineRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AirlineModule { }
