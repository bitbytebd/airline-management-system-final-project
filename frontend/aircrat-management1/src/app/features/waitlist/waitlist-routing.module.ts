import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WaitlistListComponent } from './waitlist-list/waitlist-list.component';
import { WaitlistOverbookingComponent } from './waitlist-overbooking/waitlist-overbooking.component';
 
const routes: Routes = [
  { path: '',            component: WaitlistListComponent },
  { path: 'overbooking', component: WaitlistOverbookingComponent },
];
@NgModule({ 
  imports: [
    RouterModule.forChild(routes)],
   exports: [
      RouterModule
    ] })
export class WaitlistRoutingModule { }
