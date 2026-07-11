import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'src/app/core/models/user.model';
import { UserManagementService } from 'src/app/core/services/user-management.service';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css']
})
export class UserDetailComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id: number | null = null;
  roles = [
    'SUPER_ADMIN',
    'ADMIN',
    'ADMIN_MANAGER',
    'MANAGER',
    'BOOKING_AGENT',
    'AGENT',
    'PAYMENT_OFFICER',
    'ACCOUNTANT',
    'FLIGHT_MANAGER',
    'CUSTOMER_SUPPORT',
    'STAFF',
    'VIEWER'
  ];
  statuses = ['Active', 'Inactive', 'Suspended'];

  constructor(
    private fb: FormBuilder,
    private service: UserManagementService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      employeeCode: ['', Validators.required],
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      password: ['', Validators.required],
      role: ['AGENT', Validators.required],
      department: ['Reservations'],
      station: ['Dhaka'],
      status: ['Active', Validators.required],
      lastLoginAt: ['']
    });

    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.isEdit = true;
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.service.getById(this.id).subscribe(user => this.form.patchValue(user));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const data: User = this.form.value;
    const request = this.isEdit && this.id ? this.service.update(this.id, data) : this.service.create(data);
    request.subscribe(() => this.router.navigate(['/users']));
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }
}
