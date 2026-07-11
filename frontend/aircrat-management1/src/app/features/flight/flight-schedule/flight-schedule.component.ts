import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Flight } from 'src/app/core/models/flight.model';
import { FlightService } from 'src/app/core/services/flight.service';

interface ScheduleGroup {
  date: string;
  flights: Flight[];
}

@Component({
  selector: 'app-flight-schedule',
  templateUrl: './flight-schedule.component.html',
  styleUrls: ['./flight-schedule.component.css']
})
export class FlightScheduleComponent implements OnInit {
  flights: Flight[] = [];
  searchText = '';
  selectedStatus = 'All';
  statuses = ['All', 'Scheduled', 'Delayed', 'Landed', 'Cancelled'];

  constructor(private service: FlightService, private router: Router) {}

  ngOnInit(): void {
    this.loadFlights();
  }

  get filteredFlights(): Flight[] {
    const query = this.searchText.trim().toLowerCase();
    return this.flights
      .filter(f => this.selectedStatus === 'All' || f.status === this.selectedStatus)
      .filter(f => !query || [f.flightNumber, f.origin, f.destination, f.departureDate, f.status]
        .some(value => (value || '').toString().toLowerCase().includes(query)))
      .sort((a, b) => `${a.departureDate} ${a.departureTime}`.localeCompare(`${b.departureDate} ${b.departureTime}`));
  }

  get scheduleGroups(): ScheduleGroup[] {
    const grouped = this.filteredFlights.reduce((acc, flight) => {
      const key = flight.departureDate || 'Unscheduled';
      if (!acc[key]) acc[key] = [];
      acc[key].push(flight);
      return acc;
    }, {} as Record<string, Flight[]>);
    return Object.keys(grouped).sort().map(date => ({ date, flights: grouped[date] }));
  }

  get scheduledCount(): number {
    return this.flights.filter(f => f.status === 'Scheduled').length;
  }

  get delayedCount(): number {
    return this.flights.filter(f => f.status === 'Delayed').length;
  }

  loadFlights(): void {
    this.service.getAll().subscribe(data => this.flights = data || []);
  }

  formatTime(time?: string): string {
    return time ? time.substring(0, 5) : '--:--';
  }

  statusClass(status?: string): string {
    return (status || 'scheduled').toLowerCase();
  }

  edit(id?: number): void {
    if (id) this.router.navigate(['/flight/edit', id]);
  }

  delete(id?: number): void {
    if (id && confirm('Delete this scheduled flight?')) {
      this.service.delete(id).subscribe(() => this.loadFlights());
    }
  }
}
