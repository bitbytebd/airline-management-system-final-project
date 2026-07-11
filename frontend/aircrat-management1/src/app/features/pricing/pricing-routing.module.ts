import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PricingListComponent } from './pricing-list/pricing-list.component';
import { PricingDetailComponent } from './pricing-detail/pricing-detail.component';
import { PricingSimulatorComponent } from './pricing-simulator/pricing-simulator.component';
 
const routes: Routes = [
  { path: '',    
       component: PricingListComponent
       },
  { path: 'new',    
        component: PricingDetailComponent 
      },
  { path: 'edit/:id',   
      component: PricingDetailComponent
   },
  { path: 'simulator',  
    component: PricingSimulatorComponent 
  },
];
@NgModule({
   imports: [
    RouterModule.forChild(routes)],
     exports: [
      RouterModule
    ] 
  })
export class PricingRoutingModule { }
