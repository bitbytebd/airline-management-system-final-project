import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FlightService } from 'src/app/core/services/flight.service';
import { Flight } from 'src/app/core/models/flight.model';

@Component({
  selector: 'app-flight-detail',
  templateUrl: './flight-detail.component.html',
  styleUrls: ['./flight-detail.component.css']
})
export class FlightDetailComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id: number | null = null;

  economyPrice: number = 0;
  premiumPrice: number = 0;
  businessPrice: number = 0;
  firstClassPrice: number = 0;
  validationMessage = '';

  filteredOrigins: any[] = [];
  filteredDestinations: any[] = [];
  airports: any[] = []; 

  constructor(
    private fb: FormBuilder,
    private service: FlightService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.service.getAirports().subscribe((data: any[]) => {
      this.airports = data;
      this.initializeForm();
      this.checkEditMode();
    });
  }

  initializeForm() {
    this.form = this.fb.group({
      flightNumber: ['', Validators.required],
      origin: [null], // এখানে City Name ("Dhaka") থাকবে
      destination: [null], // এখানে City Name ("London") থাকবে
      originInput: ['', Validators.required], // Display Input
      destinationInput: ['', Validators.required], // Display Input
      departureDate: ['', Validators.required],
      departureTime: ['', Validators.required],
      arrivalDate: [{ value: '', disabled: true }],
      arrivalTime: [{ value: '', disabled: true }],
      status: ['SCHEDULED', Validators.required],
      basePrice: [null, [Validators.required, Validators.min(1)]],
      distance: [{ value: 0, disabled: true }],
      economyPrice: [0], premiumPrice: [0], businessPrice: [0], firstClassPrice: [0]
    });

    // Listeners
    this.form.get('originInput')?.valueChanges.subscribe(val => {
      if (typeof val === 'string') {
        this.filterOrigin(val);
        const resolved = this.tryResolveTypedAirport('origin', val);
        const currentCity = this.form.value.origin;
        // Check if typed value no longer matches the selected city/code.
        if (!resolved && currentCity && !val.toLowerCase().includes(currentCity.toLowerCase())) {
          this.form.patchValue({ origin: null }, { emitEvent: false });
        }
      }
    });

    this.form.get('destinationInput')?.valueChanges.subscribe(val => {
      if (typeof val === 'string') {
        this.filterDestination(val);
        const resolved = this.tryResolveTypedAirport('destination', val);
        const currentCity = this.form.value.destination;
        if (!resolved && currentCity && !val.toLowerCase().includes(currentCity.toLowerCase())) {
          this.form.patchValue({ destination: null }, { emitEvent: false });
        }
      }
    });

    this.form.get('departureDate')?.valueChanges.subscribe(() => this.calculateFlightDetails());
    this.form.get('departureTime')?.valueChanges.subscribe(() => this.calculateFlightDetails());
    this.form.get('origin')?.valueChanges.subscribe(() => this.calculateFlightDetails());
    this.form.get('destination')?.valueChanges.subscribe(() => this.calculateFlightDetails());
    this.form.get('basePrice')?.valueChanges.subscribe(val => this.calculatePrices(val || 0));
  }

  checkEditMode() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.isEdit = true;
      this.service.getById(this.id).subscribe((d: any) => {
        if (d.departureTime && d.departureTime.length > 5) d.departureTime = d.departureTime.substring(0, 5);
        if (d.arrivalTime && d.arrivalTime.length > 5) d.arrivalTime = d.arrivalTime.substring(0, 5);
        
        this.form.patchValue(d);
        
        // Set Display Inputs based on City Name (DB value)
        if(d.origin) this.form.patchValue({ originInput: this.getDisplayNameByCity(d.origin) }, { emitEvent: false });
        if(d.destination) this.form.patchValue({ destinationInput: this.getDisplayNameByCity(d.destination) }, { emitEvent: false });
        
        this.calculatePrices(d.basePrice || 0);
        this.calculateFlightDetails(); 
      });
    }
  }

  // --- HELPER & FILTER ---
  
  // Find Display Name using City Name
  getDisplayNameByCity(city: string): string {
    const apt = this.airports.find(a => a.city === city);
    return apt ? `${apt.code} - ${apt.city}` : city;
  }

  filterOrigin(text: string) {
    const query = (text || '').toUpperCase();
    if (!query) { this.filteredOrigins = []; return; }
    
    // First Letter Search (startsWith)
    this.filteredOrigins = this.airports.filter(a => 
      a.code.toUpperCase().startsWith(query) || 
      a.city.toUpperCase().startsWith(query) ||
      a.country.toUpperCase().startsWith(query)
    ).slice(0, 10);
  }

  filterDestination(text: string) {
    const query = (text || '').toUpperCase();
    if (!query) { this.filteredDestinations = []; return; }
    this.filteredDestinations = this.airports.filter(a => 
      a.code.toUpperCase().startsWith(query) || 
      a.city.toUpperCase().startsWith(query) ||
      a.country.toUpperCase().startsWith(query)
    ).slice(0, 10);
  }

  // --- SELECTION LOGIC ---
  selectOriginAirport(airport: any) {
    // 1. in database, we will save City Name (e.g., "Dhaka") for origin and destination fields
    this.form.patchValue({ origin: airport.city });
    
    // 2. in input field, we will display a nice name (e.g., "DAC - Dhaka")
    this.form.patchValue({ originInput: `${airport.code} - ${airport.city}` }, { emitEvent: false });
    
    this.filteredOrigins = [];
    this.validationMessage = '';
    this.calculateFlightDetails();
  }

  selectDestinationAirport(airport: any) {
    this.form.patchValue({ destination: airport.city });
    this.form.patchValue({ destinationInput: `${airport.code} - ${airport.city}` }, { emitEvent: false });
    this.filteredDestinations = [];
    this.validationMessage = '';
    this.calculateFlightDetails();
  }

  resolveTypedAirport(type: 'origin' | 'destination') {
    const inputControl = type === 'origin' ? 'originInput' : 'destinationInput';
    const value = this.form.get(inputControl)?.value || '';
    const airport = this.findAirportFromText(value);
    const resolvedCity = airport?.city || this.extractCityFromInput(value);
    if (!resolvedCity) return;

    if (type === 'origin') {
      this.form.patchValue({ origin: resolvedCity }, { emitEvent: false });
      if (airport) {
        this.form.patchValue({ originInput: `${airport.code} - ${airport.city}` }, { emitEvent: false });
      }
      this.filteredOrigins = [];
    } else {
      this.form.patchValue({ destination: resolvedCity }, { emitEvent: false });
      if (airport) {
        this.form.patchValue({ destinationInput: `${airport.code} - ${airport.city}` }, { emitEvent: false });
      }
      this.filteredDestinations = [];
    }
    this.validationMessage = '';
  }

  isSaveDisabled(): boolean {
    return !this.form;
  }

  canSave(): boolean {
    return !this.isSaveDisabled() && !!this.form.get('origin')?.value && !!this.form.get('destination')?.value;
  }

  // --- CALCULATION LOGIC ---
  calculateFlightDetails() {
    const originCity = this.form.value.origin; // "Dhaka"
    const destCity = this.form.value.destination; // "Dubai"
    const depDateStr = this.form.value.departureDate;
    const depTimeStr = this.form.value.departureTime;

    if (originCity && destCity && depDateStr && depTimeStr) {
      
      // Find coordinates using City Name
      const originData = this.airports.find(a => a.city === originCity);
      const destData = this.airports.find(a => a.city === destCity);

      if (originData && destData && originData.lat && destData.lat) {
        // Distance
        const dist = this.calculateHaversine(originData.lat, originData.lon, destData.lat, destData.lon);
        this.form.patchValue({ distance: Math.round(dist) }, { emitEvent: false });

        // Arrival
        try {
            const depDateTime = new Date(`${depDateStr}T${depTimeStr}:00`);
            const durationMins = (dist / 850) * 60;
            const arrivalDateTime = new Date(depDateTime.getTime() + durationMins * 60000);
            
            this.form.patchValue({
              arrivalDate: this.formatLocalDate(arrivalDateTime),
              arrivalTime: arrivalDateTime.toTimeString().substring(0, 5)
            }, { emitEvent: false });
        } catch(e) { console.error('Date parse error', e); }
      }
    }
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  calculatePrices(base: number) {
    this.economyPrice = base * 1.0;
    this.premiumPrice = base * 1.5;
    this.businessPrice = base * 2.5;
    this.firstClassPrice = base * 4.0;
    if (this.form) {
      this.form.patchValue({
        economyPrice: this.economyPrice,
        premiumPrice: this.premiumPrice,
        businessPrice: this.businessPrice,
        firstClassPrice: this.firstClassPrice
      }, { emitEvent: false });
    }
  }

  onSubmit() {
    this.resolveTypedAirport('origin');
    this.resolveTypedAirport('destination');
    this.calculateFlightDetails();

    if (this.isSaveDisabled() || !this.form.get('origin')?.value || !this.form.get('destination')?.value) {
      this.form.markAllAsTouched();
      this.validationMessage = this.getValidationMessage();
      return;
    }
    
    const rawData = this.form.getRawValue();
    // Data to send: origin = "Dhaka", destination = "Dubai"
    const data: any = {
      flightNumber: rawData.flightNumber,
      origin: rawData.origin,
      destination: rawData.destination,
      departureDate: rawData.departureDate,
      departureTime: rawData.departureTime,
      arrivalDate: rawData.arrivalDate,
      arrivalTime: rawData.arrivalTime,
      status: rawData.status,
      basePrice: rawData.basePrice,
      distance: rawData.distance,
      economyPrice: rawData.economyPrice,
      premiumPrice: rawData.premiumPrice,
      businessPrice: rawData.businessPrice,
      firstClassPrice: rawData.firstClassPrice
    };

    const op = this.isEdit && this.id 
      ? this.service.update(this.id, data) 
      : this.service.create(data);

    op.subscribe(() => {
      alert(this.isEdit ? 'Flight Updated!' : 'Flight Saved!');
      this.router.navigate(['/flight']);
    });
  }

  onCancel() { this.router.navigate(['/flight']); }

  private calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private tryResolveTypedAirport(type: 'origin' | 'destination', text: string): boolean {
    const airport = this.findAirportFromText(text);
    if (!airport) return false;
    const currentValue = this.form.get(type)?.value;
    if (currentValue === airport.city) return true;
    this.form.patchValue({ [type]: airport.city }, { emitEvent: false });
    return true;
  }

  private findAirportFromText(text: string): any | null {
    const normalized = this.normalizeText(text);
    if (!normalized) return null;

    return this.airports.find(a => {
      const code = this.normalizeText(a.code);
      const city = this.normalizeText(a.city);
      const country = this.normalizeText(a.country);
      const display = this.normalizeText(`${a.code} - ${a.city}`);
      return normalized === code || normalized === city || normalized === display || normalized === country;
    }) || null;
  }

  private extractCityFromInput(value: string): string {
    const text = String(value || '').trim();
    if (!text) return '';
    if (text.includes('-')) {
      return text.split('-').slice(1).join('-').trim();
    }
    return text;
  }

  private normalizeText(value: string): string {
    return String(value || '').trim().toLowerCase();
  }

  private getValidationMessage(): string {
    if (!this.form.get('flightNumber')?.valid) return 'Flight number is required.';
    if (!this.form.get('originInput')?.valid || !this.form.get('origin')?.value) return 'Select a valid origin airport from suggestions or type an exact city/code.';
    if (!this.form.get('destinationInput')?.valid || !this.form.get('destination')?.value) return 'Select a valid destination airport from suggestions or type an exact city/code.';
    if (!this.form.get('departureDate')?.valid) return 'Departure date is required.';
    if (!this.form.get('departureTime')?.valid) return 'Departure time is required.';
    if (!this.form.get('basePrice')?.valid) return 'Base price must be greater than 0.';
    return 'Please complete all required flight fields.';
  }
}
