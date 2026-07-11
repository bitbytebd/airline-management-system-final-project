import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserListComponent } from './user-list/user-list.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserRolesComponent } from './user-roles/user-roles.component';
import { MyProfileComponent } from './my-profile/my-profile.component';
import { RoleGuard } from 'src/app/core/guards/role.guard';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'];
 
const routes: Routes = [
  { path: 'profile',  component: MyProfileComponent },
  { path: '',         component: UserListComponent, canActivate: [RoleGuard], data: { roles: ADMIN_ROLES } },
  { path: 'new',      component: UserDetailComponent, canActivate: [RoleGuard], data: { roles: ADMIN_ROLES } },
  { path: 'edit/:id', component: UserDetailComponent, canActivate: [RoleGuard], data: { roles: ADMIN_ROLES } },
  { path: 'roles',    component: UserRolesComponent, canActivate: [RoleGuard], data: { roles: ADMIN_ROLES } },
];
@NgModule({
   imports: [
    RouterModule.forChild(routes)
   ], 
    exports: [
      RouterModule
    ] })
export class UserManagementRoutingModule { }
