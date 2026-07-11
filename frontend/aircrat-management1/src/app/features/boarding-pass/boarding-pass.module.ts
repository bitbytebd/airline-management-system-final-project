import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoardingPassRoutingModule } from './boarding-pass-routing.module';
import { BoardingPassDeskComponent } from './boarding-pass-desk/boarding-pass-desk.component';

@NgModule({
  declarations: [BoardingPassDeskComponent],
  imports: [CommonModule, FormsModule, BoardingPassRoutingModule]
})
export class BoardingPassModule {}
