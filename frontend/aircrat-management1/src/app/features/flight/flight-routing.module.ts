import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlightListComponent } from './flight-list/flight-list.component';
import { FlightDetailComponent } from './flight-detail/flight-detail.component';
import { FlightScheduleComponent } from './flight-schedule/flight-schedule.component';

const routes: Routes = [
  { path: '', component: FlightListComponent },
  { path: 'schedule', component: FlightScheduleComponent },
  { path: 'new', component: FlightDetailComponent },
  { path: 'edit/:id', component: FlightDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FlightRoutingModule { }
