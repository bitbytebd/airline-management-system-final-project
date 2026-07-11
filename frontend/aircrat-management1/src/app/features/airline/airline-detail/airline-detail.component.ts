import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AirlineService } from 'src/app/core/services/airline.service';
import { Airline } from 'src/app/core/models/airline.model';

@Component({
  selector: 'app-airline-detail',
  templateUrl: './airline-detail.component.html',
  styleUrls: ['./airline-detail.component.css']
})
export class AirlineDetailComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id: number | null = null;

  constructor(
    private fb: FormBuilder,
    private service: AirlineService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      airlineName: ['', Validators.required],
      airlineCode: ['', Validators.required],
      country: [''],
      headquarters: [''],
      alliance: ['Independent'],
      fleetSize: [0, Validators.min(0)],
      iataPrefix: [''],
      primaryHub: [''],
      supportEmail: ['', Validators.email],
      supportPhone: [''],
      logoUrl: [''],
      status: ['Active']
    });

    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.isEdit = true;
      this.service.getById(this.id).subscribe(d => this.form.patchValue(d));
    }
  }

  onSubmit() {
    if (this.form.invalid) return;
    const data: Airline = this.form.value;
    const op = this.isEdit ? this.service.update(this.id!, data) : this.service.create(data);
    op.subscribe(() => this.router.navigate(['/airline']));
  }

  onCancel() {
    this.router.navigate(['/airline']);
  }
}
