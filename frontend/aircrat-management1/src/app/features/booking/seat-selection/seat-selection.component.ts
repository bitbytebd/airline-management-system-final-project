import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { BookingService } from 'src/app/core/services/booking.service';

@Component({
  selector: 'app-seat-selection',
  templateUrl: './seat-selection.component.html',
  styleUrls: ['./seat-selection.component.css']
})
export class SeatSelectionComponent implements OnInit {
  @Input() flightId: number | undefined;
  @Input() maxSeats = 1;
  @Input() selectedSeats: string[] = [];
  @Input() selectedClassType = '';
  @Output() seatSelected = new EventEmitter<string>();
  @Output() seatsChanged = new EventEmitter<string[]>();

  // Backend Data Store
  bookedSeats: Set<string> = new Set();
  pendingSeats: Set<string> = new Set();
  selectionMessage = '';

  // Row Configuration (International Standard Layout)
  // First Class: Rows 1-2
  firstClassRows: number[] = [1, 2];
  // Business Class: Rows 3-5
  businessRows: number[] = [3, 4, 5];
  // Premium Economy: Rows 6-10
  premiumRows: number[] = [6, 7, 8, 9, 10];
  // Economy: Rows 11-20
  economyRows: number[] = Array.from({length: 10}, (_, i) => i + 11);

  constructor(private service: BookingService) {}

  ngOnInit(): void {
    if (this.flightId) {
      this.loadSeatMap();
    }
  }

  loadSeatMap() {
    this.service.getSeatMap(this.flightId!).subscribe((data: any[]) => {
      this.bookedSeats.clear();
      this.pendingSeats.clear();
      data.forEach(seat => {
        if (seat.status === 'BOOKED' || seat.status === 'CONFIRMED') {
          this.bookedSeats.add(seat.seatNumber);
        }
        if (seat.status === 'PENDING') {
          this.pendingSeats.add(seat.seatNumber);
        }
      });
    });
  }

  getStatus(row: number, col: string): string {
    const seatNo = row + col;
    if (this.selectedSeats.includes(seatNo)) return 'SELECTED';
    if (this.bookedSeats.has(seatNo)) return 'OCCUPIED';
    if (this.pendingSeats.has(seatNo)) return 'PENDING';
    if (!this.isSeatInSelectedClass(row)) return 'CLASS_DISABLED';
    return 'AVAILABLE';
  }

  selectSeat(row: number, col: string) {
    const seatNo = row + col;
    if (this.bookedSeats.has(seatNo) || this.pendingSeats.has(seatNo)) return;
    if (!this.isSeatInSelectedClass(row)) {
      this.selectionMessage = 'Select a seat from your chosen cabin class.';
      return;
    }

    const current = [...this.selectedSeats];
    if (current.includes(seatNo)) {
      this.selectedSeats = current.filter(seat => seat !== seatNo);
      this.selectionMessage = '';
    } else {
      if (current.length >= this.maxSeats) {
        this.selectionMessage = `You can select only ${this.maxSeats} seat${this.maxSeats === 1 ? '' : 's'}.`;
        return;
      }
      this.selectedSeats = [...current, seatNo];
      this.selectionMessage = '';
    }
    this.seatSelected.emit(this.selectedSeats.join(','));
    this.seatsChanged.emit([...this.selectedSeats]);
  }

  getSeatTitle(row: number): string {
    return this.isSeatInSelectedClass(row) ? '' : 'Select a seat from your chosen cabin class.';
  }

  private getCabinClassByRow(row: number): string {
    if (row >= 1 && row <= 2) return 'FIRST_CLASS';
    if (row >= 3 && row <= 5) return 'BUSINESS';
    if (row >= 6 && row <= 10) return 'PREMIUM';
    if (row >= 11 && row <= 20) return 'ECONOMY';
    return '';
  }

  private isSeatInSelectedClass(row: number): boolean {
    const selectedClass = String(this.selectedClassType || '').trim().toUpperCase();
    return !!selectedClass && this.getCabinClassByRow(row) === selectedClass;
  }
}
