import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RefundListComponent } from './refund-list/refund-list.component';
import { RefundPendingComponent } from './refund-pending/refund-pending.component';
import { RefundInitiateComponent } from './refund-initiate/refund-initiate.component';
 
const routes: Routes = [
  { path: '',       component: RefundListComponent },
  { path: 'pending',  component: RefundPendingComponent },
  { path: 'initiate', component: RefundInitiateComponent },
];
@NgModule({
   imports: [
    RouterModule.forChild(routes)
   ], 
    exports: [
      RouterModule
    ] })
export class RefundRoutingModule { }
