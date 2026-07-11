import { Component, OnInit } from '@angular/core';
import { FlightService } from 'src/app/core/services/flight.service';
import { Flight } from 'src/app/core/models/flight.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-flight-list',
  templateUrl: './flight-list.component.html',
  styleUrls: ['./flight-list.component.css']
})
export class FlightListComponent implements OnInit {
  flights: Flight[] = [];
  airports: any[] = []; 
  sourceModule: string | null = null;
  
  constructor(private service: FlightService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.sourceModule = this.route.snapshot.queryParamMap.get('from');
    this.loadFlights();
    this.loadAirports();
  }

  loadAirports() {
    this.service.getAirports().subscribe((data: any[]) => {
      this.airports = data;
    });
  }

  loadFlights() {
    this.service.getAll().subscribe(data => {
      this.flights = data;
    });
  }

  // Since DB has "Dhaka", we can show "DAC - Dhaka" for better UX
  getCityDisplay(cityName: string): string {
    const apt = this.airports.find(a => a.city === cityName);
    return apt ? `${apt.code} - ${apt.city}` : cityName;
  }

  formatTime(time: string | undefined): string {
    if (!time) return '-';
    return time.substring(0, 5);
  }

  onEdit(id: number | undefined) {
    if (id) {
      this.router.navigate(['/flight/edit', id]);
    }
  }

  onDelete(id: number | undefined) {
    if (id && confirm('Are you sure to delete this flight?')) {
      this.service.delete(id).subscribe(() => {
        this.loadFlights();
      });
    }
  }

  backToSource(): void {
    if (this.sourceModule === 'aircraft') {
      this.router.navigate(['/aircraft']);
    } else if (this.sourceModule === 'airline') {
      this.router.navigate(['/airline']);
    } else {
      this.router.navigate(['/dashboard/overview']);
    }
  }
}
