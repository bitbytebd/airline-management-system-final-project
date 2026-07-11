import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExpenseReportComponent } from './expense-report/expense-report.component';
import { FinancialOverviewComponent } from './financial-overview/financial-overview.component';
import { FlightSeatReportComponent } from './flight-seat-report/flight-seat-report.component';
import { SalesReportComponent } from './sales-report/sales-report.component';

const routes: Routes = [
  { path: '', redirectTo: 'financial-overview', pathMatch: 'full' },
  { path: 'expense', component: ExpenseReportComponent },
  { path: 'financial-overview', component: FinancialOverviewComponent },
  { path: 'flight-seat', component: FlightSeatReportComponent },
  { path: 'sales', component: SalesReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportRoutingModule { }
