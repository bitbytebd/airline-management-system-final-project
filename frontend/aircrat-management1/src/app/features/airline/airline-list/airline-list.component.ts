import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Airline } from 'src/app/core/models/airline.model';
import { AirlineService } from 'src/app/core/services/airline.service';

@Component({
  selector: 'app-airline-list',
  templateUrl: './airline-list.component.html',
  styleUrls: ['./airline-list.component.css']
})
export class AirlineListComponent implements OnInit {
  airlines: Airline[] = [];
  searchText = '';
  showSuggestions = false;
  viewMode: 'card' | 'table' = 'card';

  constructor(private service: AirlineService, private router: Router) {}

  ngOnInit(): void {
    this.loadAirlines();
  }

  get filteredAirlines(): Airline[] {
    const query = this.searchText.trim().toLowerCase();
    if (!query) return this.airlines;
    return this.airlines.filter(a =>
      [a.airlineName, a.airlineCode, a.country, a.headquarters, a.alliance, a.primaryHub, a.status]
        .some(value => (value || '').toString().toLowerCase().includes(query))
    );
  }

  get airlineSuggestions(): Airline[] {
    const query = this.searchText.trim().toLowerCase();
    if (!query) return [];
    return this.airlines.filter(a =>
      [a.airlineName, a.airlineCode, a.country, a.headquarters, a.alliance, a.primaryHub, a.status]
        .some(value => (value || '').toString().toLowerCase().startsWith(query) || (value || '').toString().toLowerCase().includes(query))
    ).slice(0, 8);
  }

  get activeCount(): number {
    return this.airlines.filter(a => a.status === 'Active').length;
  }

  get fleetTotal(): number {
    return this.airlines.reduce((sum, a) => sum + (Number(a.fleetSize) || 0), 0);
  }

  loadAirlines(): void {
    this.service.getAll().subscribe(data => this.airlines = data || []);
  }

  onSearchFocus(): void {
    this.showSuggestions = this.searchText.trim().length > 0;
  }

  onSearchChange(): void {
    this.showSuggestions = this.searchText.trim().length > 0;
  }

  selectSuggestion(airline: Airline): void {
    this.searchText = airline.airlineCode || airline.airlineName || '';
    this.showSuggestions = false;
  }

  onEdit(id: number | undefined): void {
    if (id) this.router.navigate(['/airline/edit', id]);
  }

  onDelete(id: number | undefined): void {
    if (id && confirm('Are you sure to delete this airline?')) {
      this.service.delete(id).subscribe(() => this.loadAirlines());
    }
  }

  openFlights(): void {
    this.router.navigate(['/flight'], { queryParams: { from: 'airline' } });
  }
}
