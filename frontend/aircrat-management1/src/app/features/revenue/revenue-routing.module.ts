import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfitLossComponent } from './profit-loss/profit-loss.component';
import { ForecastComponent } from './forecast/forecast.component';
import { KpiSummaryComponent } from './kpi-summary/kpi-summary.component';
 
const routes: Routes = [
  { path: '',       
    redirectTo: 'profit-loss', pathMatch: 'full' },
  
  { path: 'profit-loss', 
       component: ProfitLossComponent 
      },
  { path: 'forecast',   
     component: ForecastComponent
     },
  { path: 'summary',   
      component: KpiSummaryComponent
     },
];
@NgModule({
   imports: [
    RouterModule.forChild(routes)],
    
  exports: [
      RouterModule
    ] 
  })
export class RevenueRoutingModule { }
