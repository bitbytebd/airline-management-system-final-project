import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TrackingRoutingModule } from './tracking-routing.module';
import { TrackingListComponent } from './tracking-list/tracking-list.component';
import { TrackingStatusComponent } from './tracking-status/tracking-status.component';
import { TrackingUpdateComponent } from './tracking-update/tracking-update.component';
 
@NgModule({
  declarations: [
    TrackingListComponent, 
    TrackingStatusComponent, 
    TrackingUpdateComponent],
  imports: [
    CommonModule,
     FormsModule,
      ReactiveFormsModule,
       TrackingRoutingModule]
})
export class TrackingModule { }
