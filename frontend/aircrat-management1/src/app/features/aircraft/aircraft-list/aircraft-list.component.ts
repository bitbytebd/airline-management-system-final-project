import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Aircraft } from 'src/app/core/models/aircraft.model';
import { AircraftService } from 'src/app/core/services/aircraft.service';

@Component({
  selector: 'app-aircraft-list',
  templateUrl: './aircraft-list.component.html',
  styleUrls: ['./aircraft-list.component.css']
})
export class AircraftListComponent implements OnInit {
  aircrafts: Aircraft[] = [];
  searchText = '';
  showSuggestions = false;
  viewMode: 'card' | 'table' = 'card';

  constructor(private service: AircraftService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  get filteredAircrafts(): Aircraft[] {
      const query = this.searchText.trim().toLowerCase();
       if (!query) return this.aircrafts;
      
       return this.aircrafts.filter(a =>
         [a.aircraftCode, a.aircraftName, a.modelName, a.registrationNumber, a.manufacturer, a.aircraftType, a.status]
           .some(value => (value || '').toString().toLowerCase().includes(query))
    );
  }

  get aircraftSuggestions(): Aircraft[] {
       const query = this.searchText.trim().toLowerCase();
      if (!query) return [];
         return this.aircrafts.filter(a =>
         [a.aircraftCode, a.aircraftName, a.modelName, a.registrationNumber, a.manufacturer, a.aircraftType, a.status]
           .some(value => (value || '').toString().toLowerCase().startsWith(query) || (value || '').toString().toLowerCase().includes(query))
    ).slice(0, 8);
  }

  get totalSeats(): number {
       return this.aircrafts.reduce((sum, item) => sum + (Number(item.capacity) || 0), 0);
     }

  get activeCount(): number {
        return this.aircrafts.filter(item => item.status === 'Active').length;
      }

  load(): void {
         this.service.getAircrafts().subscribe(d => this.aircrafts = d || []);
  }

  onSearchFocus(): void {
        this.showSuggestions = this.searchText.trim().length > 0;
    }

  onSearchChange(): void {
        this.showSuggestions = this.searchText.trim().length > 0;
   }

  selectSuggestion(aircraft: Aircraft): void {
       this.searchText = aircraft.aircraftCode || aircraft.aircraftName || aircraft.modelName || '';
        this.showSuggestions = false;
    }

  onEdit(id: number | undefined): void {
       if (id) this.router.navigate(['/aircraft/edit', id]);
  }

  onDelete(id: number | undefined): void {
        if (id && confirm('Delete this aircraft?')) {
          this.service.deleteAircraft(id).subscribe(() => this.load());
    }
  }

  onAdd(): void {
        this.router.navigate(['/aircraft/new']);
  }

  openFlights(): void {
        this.router.navigate(['/flight'], { queryParams: { from: 'aircraft' } });
  }
}
