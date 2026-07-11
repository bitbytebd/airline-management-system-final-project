import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AircraftListComponent } from './aircraft-list/aircraft-list.component';
import { AircraftDetailComponent } from './aircraft-detail/aircraft-detail.component';

const routes: Routes = [
  { path: '', component: AircraftListComponent },
  { path: 'new', component: AircraftDetailComponent },
  { path: 'edit/:id', component: AircraftDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AircraftRoutingModule { }