import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; 

import { ExpenseRoutingModule } from './expense-routing.module';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';
import { ExpenseCategoryComponent } from './expense-category/expense-category.component';
import { ExpensePaymentQueueComponent } from './expense-payment-queue/expense-payment-queue.component';
import { ExpensePaymentProcessComponent } from './expense-payment-process/expense-payment-process.component';
import { ExpensePaymentVoucherComponent } from './expense-payment-voucher/expense-payment-voucher.component';


@NgModule({
  declarations: [
    ExpenseListComponent,
    ExpenseDetailComponent,
    ExpenseCategoryComponent,
    ExpensePaymentQueueComponent,
    ExpensePaymentProcessComponent,
    ExpensePaymentVoucherComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ExpenseRoutingModule
  ]
})
export class ExpenseModule { }
