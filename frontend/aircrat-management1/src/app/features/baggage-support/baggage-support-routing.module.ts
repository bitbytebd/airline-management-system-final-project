import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BaggageSupportDeskComponent } from './baggage-support-desk/baggage-support-desk.component';

const routes: Routes = [
  { path: '', component: BaggageSupportDeskComponent },
  { path: 'open-cases', component: BaggageSupportDeskComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BaggageSupportRoutingModule {}
