import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PassengerListComponent } from './passenger-list/passenger-list.component';
import { PassengerDetailComponent } from './passenger-detail/passenger-detail.component';

const routes: Routes = [
  { path: '', component: PassengerListComponent },
  { path: 'new', component: PassengerDetailComponent },
  { path: 'edit/:id', component: PassengerDetailComponent }
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })

export class PassengerRoutingModule { }