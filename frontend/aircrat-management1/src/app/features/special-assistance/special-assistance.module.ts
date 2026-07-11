import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpecialAssistanceRoutingModule } from './special-assistance-routing.module';
import { SpecialAssistanceDeskComponent } from './special-assistance-desk/special-assistance-desk.component';

@NgModule({
  declarations: [SpecialAssistanceDeskComponent],
  imports: [CommonModule, FormsModule, SpecialAssistanceRoutingModule]
})
export class SpecialAssistanceModule {}
