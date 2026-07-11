import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RoleGuard } from 'src/app/core/guards/role.guard';
import { TrackingListComponent } from './tracking-list/tracking-list.component';
import { PublicFlightTrackerComponent } from './public-flight-tracker/public-flight-tracker.component';
import { TrackingStatusComponent } from './tracking-status/tracking-status.component';
import { TrackingUpdateComponent } from './tracking-update/tracking-update.component';
 
const routes: Routes = [
  { path: '',   
      component: TrackingListComponent 
    },
  { path: 'status',  
     component: TrackingStatusComponent 
    },
  { path: 'public',
     component: PublicFlightTrackerComponent
    },
  { path: 'update', 
      component: TrackingUpdateComponent,
      canActivate: [RoleGuard],
      data: { roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] }
     },
];
@NgModule({
  imports: [
    RouterModule.forChild(routes)],
 exports: [
    RouterModule
    ] 
  })
export class TrackingRoutingModule { }
