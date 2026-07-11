import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RefundRoutingModule } from './refund-routing.module';
import { RefundListComponent } from './refund-list/refund-list.component';
import { RefundPendingComponent } from './refund-pending/refund-pending.component';
import { RefundInitiateComponent } from './refund-initiate/refund-initiate.component';


@NgModule({
  declarations: [
    RefundListComponent,
    RefundPendingComponent,
    RefundInitiateComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RefundRoutingModule
  ]
})
export class RefundModule { }
