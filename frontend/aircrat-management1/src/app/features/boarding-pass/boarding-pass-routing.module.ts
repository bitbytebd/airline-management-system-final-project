import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardingPassDeskComponent } from './boarding-pass-desk/boarding-pass-desk.component';

const routes: Routes = [
  { path: '', component: BoardingPassDeskComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BoardingPassRoutingModule {}
