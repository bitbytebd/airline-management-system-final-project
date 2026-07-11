import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { RevenueRoutingModule } from './revenue-routing.module';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';
import { ForecastComponent } from './forecast/forecast.component';
import { KpiSummaryComponent } from './kpi-summary/kpi-summary.component';


@NgModule({
  declarations: [
    ProfitLossComponent,
    ForecastComponent,
    KpiSummaryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RevenueRoutingModule
  ]
})
export class RevenueModule { }
