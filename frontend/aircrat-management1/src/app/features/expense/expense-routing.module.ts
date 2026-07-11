import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseListComponent } from './expense-list/expense-list.component';
import { ExpenseDetailComponent } from './expense-detail/expense-detail.component';
import { ExpenseCategoryComponent } from './expense-category/expense-category.component';
import { ExpensePaymentQueueComponent } from './expense-payment-queue/expense-payment-queue.component';
import { ExpensePaymentProcessComponent } from './expense-payment-process/expense-payment-process.component';
import { ExpensePaymentVoucherComponent } from './expense-payment-voucher/expense-payment-voucher.component';

const routes: Routes = [
  { path: '', component: ExpenseListComponent },        // /expense
  { path: 'new', component: ExpenseDetailComponent },   // /expense/new
  { path: 'edit/:id', component: ExpenseDetailComponent }, // /expense/edit/1
  { path: 'category', component: ExpenseCategoryComponent }, // /expense/category
  { path: 'payment-queue', component: ExpensePaymentQueueComponent },
  { path: 'payment/:id', component: ExpensePaymentProcessComponent },
  { path: 'payment-voucher/:paymentId', component: ExpensePaymentVoucherComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpenseRoutingModule { }
