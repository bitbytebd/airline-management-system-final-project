import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ExpenseService } from 'src/app/core/services/expense.service';
import { Expense } from 'src/app/core/models/expense.model';

@Component({
  selector: 'app-expense-detail',
  templateUrl: './expense-detail.component.html',
  styleUrls: ['./expense-detail.component.css']
})
export class ExpenseDetailComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id: number | null = null;

  constructor(
    private fb: FormBuilder,
    private service: ExpenseService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize Form with Validation
    this.form = this.fb.group({
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      expenseDate: ['', Validators.required],
      department: [''],
      vendorName: [''],
      paymentMethod: ['CASH'],
      referenceNo: [''],
      status: ['PENDING_PAYMENT'],
      description: [''],
      bookingReference: ['']
    });

    // Check for Edit Mode
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.isEdit = true;
      this.loadExpenseData(this.id);
    }
  }

  loadExpenseData(id: number) {
    this.service.getById(id).subscribe(data => {
      // Format date for input type="date" (expects YYYY-MM-DD)
      if (data.expenseDate) {
        const dateStr = new Date(data.expenseDate).toISOString().substring(0, 10);
        data.expenseDate = dateStr as any;
      }
      this.form.patchValue(data);
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.markAllAsTouched(); // Show errors
      return;
    }

    const data: Expense = this.form.value;

    if (this.isEdit && this.id) {
      this.service.update(this.id, data).subscribe(() => {
        this.router.navigate(['/expense']);
      });
    } else {
      this.service.create(data).subscribe(() => {
        this.router.navigate(['/expense']);
      });
    }
  }

  // Helper to show validation errors
  markAllAsTouched() {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }
}
