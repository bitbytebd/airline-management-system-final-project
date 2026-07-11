import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AirlineListComponent } from './airline-list/airline-list.component';
import { AirlineDetailComponent } from './airline-detail/airline-detail.component';

const routes: Routes = [
  { path: '', component: AirlineListComponent },
  { path: 'new', component: AirlineDetailComponent },
  { path: 'edit/:id', component: AirlineDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AirlineRoutingModule { }