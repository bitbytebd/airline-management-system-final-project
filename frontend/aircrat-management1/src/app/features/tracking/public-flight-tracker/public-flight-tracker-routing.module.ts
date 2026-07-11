import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicFlightTrackerComponent } from './public-flight-tracker.component';

const routes: Routes = [
  { path: '', component: PublicFlightTrackerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicFlightTrackerRoutingModule { }
