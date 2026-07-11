import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ReportRoutingModule } from './report-routing.module';

import { FinancialOverviewComponent } from './financial-overview/financial-overview.component';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { ExpenseReportComponent } from './expense-report/expense-report.component';
import { FlightSeatReportComponent } from './flight-seat-report/flight-seat-report.component';


@NgModule({
  declarations: [
    FinancialOverviewComponent,
    SalesReportComponent,
    ExpenseReportComponent,
    FlightSeatReportComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule,
    ReportRoutingModule
  ],
  exports: [
    FinancialOverviewComponent,
    SalesReportComponent,
    ExpenseReportComponent
  ]
})
export class ReportModule { }
