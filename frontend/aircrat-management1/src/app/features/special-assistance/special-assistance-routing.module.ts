import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpecialAssistanceDeskComponent } from './special-assistance-desk/special-assistance-desk.component';

const routes: Routes = [
  { path: '', component: SpecialAssistanceDeskComponent },
  { path: 'requests', component: SpecialAssistanceDeskComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpecialAssistanceRoutingModule {}
