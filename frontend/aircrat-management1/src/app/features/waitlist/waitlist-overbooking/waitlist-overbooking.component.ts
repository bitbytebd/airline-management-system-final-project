import { Component, OnInit } from '@angular/core';
import { OverbookingSummary, WaitlistEntry } from 'src/app/core/models/waitlist.model';
import { WaitlistService } from 'src/app/core/services/waitlist.service';

@Component({
  selector: 'app-waitlist-overbooking',
  templateUrl: './waitlist-overbooking.component.html',
  styleUrls: ['./waitlist-overbooking.component.css']
})
export class WaitlistOverbookingComponent implements OnInit {
  rows: OverbookingSummary[] = [];
  entries: WaitlistEntry[] = [];
  selectedFlight = '';
  loading = true;

  guidance = [
    'High requested seat count means the flight has strong unmet demand.',
    'Average priority helps staff decide whether to release seats, upgrade, or negotiate alternate flights.',
    'Use Notify before Confirm so passenger communication remains visible in the queue.'
  ];

  constructor(private service: WaitlistService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.service.getOverbookingSummary().subscribe({
      next: rows => { this.rows = rows; this.loading = false; },
      error: () => { this.rows = []; this.loading = false; }
    });
    this.service.getAll().subscribe({ next: entries => this.entries = entries || [] });
  }

  select(row: OverbookingSummary): void {
    this.selectedFlight = row.flightNumber;
  }

  visibleEntries(): WaitlistEntry[] {
    if (!this.selectedFlight) return this.entries.slice(0, 8);
    return this.entries.filter(e => e.flightNumber === this.selectedFlight).slice(0, 8);
  }

  pressure(row: OverbookingSummary): number {
    return Math.min(100, Math.round((row.requestedSeats * 12) + (row.avgPriority * 0.45)));
  }
}
