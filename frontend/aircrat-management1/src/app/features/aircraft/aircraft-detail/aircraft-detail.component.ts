import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Aircraft } from 'src/app/core/models/aircraft.model';
import { AircraftService } from 'src/app/core/services/aircraft.service';

@Component({
  selector: 'app-aircraft-detail',
  templateUrl: './aircraft-detail.component.html',
  styleUrls: ['./aircraft-detail.component.css']
})
export class AircraftDetailComponent implements OnInit {
    form!: FormGroup;
     isEdit = false;
     id: number | null = null;

   constructor(
        private fb: FormBuilder,
       private service: AircraftService,
       private route: ActivatedRoute,
       private router: Router
      ) {}

  ngOnInit(): void {
    this.form = this.fb.group({

      aircraftCode: ['', Validators.required],
      aircraftName: ['', Validators.required],
      modelName: ['', Validators.required],
      registrationNumber: ['', Validators.required],
      manufacturer: [''],
      aircraftType: ['Wide-body'],
      capacity: [0, [Validators.required, Validators.min(1)]],
      cabinClasses: ['Economy, Premium Economy, Business'],
      rangeKm: [0, Validators.min(0)],
      cruiseSpeedKmh: [0, Validators.min(0)],
      imageUrl: [''],
      status: ['Active', Validators.required]

    });

    this.id = Number(this.route.snapshot.paramMap.get('id'));
   
       if (this.id) {
          this.isEdit = true;
          this.service.getAircrafts().subscribe(list => {
           const data = list.find(x => x.id === this.id);
          if (data) this.form.patchValue(data);
       });
    }
  }

  onSubmit(): void {
       if (this.form.invalid) {
         this.form.markAllAsTouched();
         return;
      }
    const data: Aircraft = this.form.value;
    const request = this.isEdit && this.id
      ? this.service.updateAircraft(this.id, data)
      : this.service.createAircraft(data);
    request.subscribe(() => this.goBack());
  }

  goBack(): void {
    this.router.navigate(['/aircraft']);
  }
}
