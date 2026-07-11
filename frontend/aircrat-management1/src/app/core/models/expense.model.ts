
 export class Expense {
  id?: number;
  category: string;
  amount: number;
  expenseDate: string; // YYYY-MM-DD
  description: string;
  vendorName: string;
  paymentMethod: string;
  referenceNo: string;
  department: string;
  status: string;
  bookingReference: string;

  constructor() {
    this.category = '';
    this.amount = 0;
    this.expenseDate = '';
    this.description = '';
    this.vendorName = '';
    this.paymentMethod = 'CASH';
    this.referenceNo = '';
    this.department = '';
    this.status = 'PENDING_PAYMENT';
    this.bookingReference = '';
  }
}
