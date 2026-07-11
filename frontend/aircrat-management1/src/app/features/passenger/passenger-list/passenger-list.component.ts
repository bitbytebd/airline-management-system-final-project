import { Component, OnInit } from '@angular/core';
import { PassengerService } from 'src/app/core/services/passenger.service';
import { Passenger } from 'src/app/core/models/passenger.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-passenger-list',
  templateUrl: './passenger-list.component.html',
  styleUrls: ['./passenger-list.component.css']
})
export class PassengerListComponent implements OnInit {
  passengers: Passenger[] = [];

  constructor(private passengerService: PassengerService, private router: Router) {}

  ngOnInit(): void {
    this.loadPassengers();
  }

  loadPassengers() {
    // Fixed Method Name
    this.passengerService.getPassengers().subscribe({
      next: (data) => this.passengers = data,
      error: (err: any) => console.error('Failed to load passengers', err)
    });
  }

  onEdit(id: number | undefined) {
    if (id) this.router.navigate(['/passenger/edit', id]);
  }

  onDelete(id: number | undefined) {
    if (id && confirm('Delete this passenger?')) {
      // Fixed Method Name
      this.passengerService.deletePassenger(id).subscribe({
        next: () => this.loadPassengers(),
        error: (err: any) => console.error('Delete failed', err)
      });
    }
  }
}