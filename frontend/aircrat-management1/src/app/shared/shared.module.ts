import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { FooterComponent } from './components/footer/footer.component';

import { RouterModule } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    NavbarComponent,
    SidebarComponent,
    FooterComponent,

    HeaderComponent
  ],
  imports: [
    CommonModule,
   FormsModule, 
    RouterModule
  ],
  exports: [
    NavbarComponent,
    SidebarComponent,
    FooterComponent,
    HeaderComponent,
    RouterModule
  ]
})
export class SharedModule { }
