import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BookingService } from 'src/app/core/services/booking.service';
import { CouponService } from 'src/app/core/services/coupon.service';
import { FlightService } from 'src/app/core/services/flight.service';
import { LoyaltyService } from 'src/app/core/services/loyalty.service';
import { AirportOperationsService } from 'src/app/core/services/airport-operations.service';
import { Booking } from 'src/app/core/models/booking.model';
import { Coupon } from 'src/app/core/models/coupon.model';
import { LoyaltyAccount } from 'src/app/core/models/loyalty.model';
import { BaggageSupportCase, SpecialAssistanceRequest } from 'src/app/core/models/airport-operations.model';

type ExtraPassengerType = 'ADULT' | 'CHILD' | 'INFANT';

interface ExtraPassengerField {
  type: ExtraPassengerType;
  serial: number;
  name: string;
  label: string;
  key: string;
}

@Component({
  selector: 'app-booking-detail',
  templateUrl: './booking-detail.component.html',
  styleUrls: ['./booking-detail.component.css']
})
export class BookingDetailComponent implements OnInit {
  form!: FormGroup;
  isEdit = false;
  id: number | null = null;
  
  // UI State
  tripType: 'ONE_WAY' | 'ROUND_TRIP' = 'ONE_WAY';
  showPassengerDropdown = false;
  showResults = false;
  isSeatModalOpen = false; // For Popup Modal
  
  // Data
  allFlights: any[] = []; 
  bookableFlights: any[] = [];
  filteredOrigins: string[] = []; 
  filteredDestinations: string[] = [];
  uniqueOrigins: string[] = [];
  uniqueDestinations: string[] = [];
  allCityOptions: string[] = [];

  selectedOriginText: string = '';
  selectedDestText: string = '';
  
  adults = 1; children = 0; infants = 0;
  filteredFlights: any[] = [];
  couponSuggestions: Coupon[] = [];
  loyaltySuggestions: LoyaltyAccount[] = [];
  selectedLoyalty: LoyaltyAccount | null = null;
  selectedCoupon: Coupon | null = null;
  couponMessage = '';
  loyaltyMessage = '';
  submitting = false;
  submitError = '';
  extraPassengerError = '';
  seatSelectionError = '';
  additionalPassengerFields: ExtraPassengerField[] = [];
  selectedSeats: string[] = [];
  selectedSpecialServices: string[] = [];
  readonly specialServiceFees: { [key: string]: number } = {
    'Wheelchair Assistance': 0,
    'Medical Support': 50,
    'Infant Assistance': 0,
    'Special Meal': 15,
    'Priority Boarding': 25
  };

  // --- DYNAMIC PRICE LOGIC ---
  // Class wise Multiplier (Economy = 1x, Business = 2.5x)
  classMultipliers: { [key: string]: number } = {
    'ECONOMY': 1,
    'PREMIUM': 1.5,
    'BUSINESS': 2.5,
    'FIRST_CLASS': 4.0
  };

  constructor(
    private fb: FormBuilder,
    private bookingService: BookingService,
    private couponService: CouponService,
    private loyaltyService: LoyaltyService,
    private flightService: FlightService,
    private airportOperationsService: AirportOperationsService,
    private route: ActivatedRoute,
    public router: Router,
    private eRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFlightDataFromBackend();
    
    // Recalculate price and keep selected seats aligned with the chosen cabin class.
    this.form.get('classType')?.valueChanges.subscribe(() => {
      this.selectedSeats = this.selectedSeats.filter(seat => this.isSeatInSelectedClass(seat));
      this.syncSelectedSeatsWithPassengerCount();
      this.seatSelectionError = '';
      this.calculatePrice();
    });
    this.form.get('checkedWeightKg')?.valueChanges.subscribe(() => this.calculatePrice());
    this.form.get('cabinWeightKg')?.valueChanges.subscribe(() => this.calculatePrice());
    this.form.get('baggageFee')?.valueChanges.subscribe(() => this.calculatePrice());
    this.form.get('specialServiceFee')?.valueChanges.subscribe(() => this.calculatePrice());

    // Edit Mode Logic
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (this.id) {
      this.isEdit = true;
      this.bookingService.getById(this.id).subscribe(d => {
        this.form.patchValue(d);
        this.selectedOriginText = d.origin;
        this.selectedDestText = d.destination;
        this.tripType = (d.tripType as 'ONE_WAY' | 'ROUND_TRIP') || 'ONE_WAY';
        this.adults = d.adultCount || 1;
        this.children = d.childCount || 0;
        this.infants = d.infantCount || 0;
        this.syncAdditionalPassengerFields(d.extraPassengerNames);
        this.selectedSeats = this.parseSeatNumbers(d.seatNumber);
        this.syncSelectedSeatsWithPassengerCount();
        this.selectedSpecialServices = d.specialServices ? d.specialServices.split(',').map(s => s.trim()).filter(Boolean) : [];
        this.showResults = true;
        this.calculatePrice();
      });
    }
  }

  initForm() {
    this.form = this.fb.group({
      passengerId: [''], // Will auto-generate if empty
      passengerName: [''],
      passportNumber: [''],
      email: [''],
      phone: [''],
      flightId: ['', Validators.required],
      flightNumber: [''],
      origin: [''],
      destination: [''],
      departureDate: ['', Validators.required],
      tripType: ['ONE_WAY'],
      returnDate: [''],
      departureTime: [''],
      arrivalTime: [''],
      totalDistance: [0],
      classType: ['ECONOMY'],
      seatNumber: [''],
      adultCount: [1],
      childCount: [0],
      infantCount: [0],
      extraPassengerNames: [''],
      baseFare: [0], // Stores Economy Base Price
      tax: [0],
      discount: [0],
      couponCode: [''],
      couponDiscount: [0],
      loyaltyMemberNumber: [''],
      loyaltyPointsUsed: [0],
      loyaltyDiscount: [0],
      adultFareTotal: [0],
      childFareTotal: [0],
      infantFareTotal: [0],
      passengerFareTotal: [0],
      baggageFee: [0],
      specialServiceFee: [0],
      subTotalBeforeDiscount: [0],
      totalPrice: [0],
      grandTotal: [0],
      checkedBags: [0],
      checkedWeightKg: [0],
      cabinWeightKg: [0],
      specialServices: [''],
      specialServiceNotes: [''],
      paymentMethod: ['PENDING'],
      paymentStatus: ['PENDING'],
      status: ['PENDING_REVIEW']
    });
  }

  // --- BACKEND DATA LOAD ---
  loadFlightDataFromBackend() {
    this.flightService.getAll().subscribe((flights: any[]) => {
      this.allFlights = flights;
      this.bookableFlights = (flights || []).filter(f => this.isFlightBookable(f));
      const origins = this.bookableFlights.map(f => f.origin);
      const destinations = this.bookableFlights.map(f => f.destination);
      this.uniqueOrigins = [...new Set(origins)];
      this.allCityOptions = [...new Set([...origins, ...destinations])].filter(Boolean).sort();
    });
  }

  // --- SEARCH LOGIC ---
  filterOrigin(text: string) {
    this.selectedOriginText = text;
    if (!text) { this.filteredOrigins = []; return; }
    this.filteredOrigins = this.matchCities(text, this.allCityOptions);
  }
  selectOrigin(origin: string) {
    this.form.patchValue({ origin: origin, destination: '' });
    this.selectedOriginText = origin;
    this.filteredOrigins = [];
    const availableDests = this.bookableFlights.filter(f => f.origin === origin).map(f => f.destination);
    this.uniqueDestinations = [...new Set(availableDests)].filter(Boolean).sort();
    this.selectedDestText = '';
  }
  filterDestination(text: string) {
    this.selectedDestText = text;
    if (!text) { this.filteredDestinations = []; return; }
    const preferred = this.uniqueDestinations.length ? this.uniqueDestinations : this.allCityOptions;
    const matched = this.matchCities(text, preferred);
    this.filteredDestinations = matched.length ? matched : this.matchCities(text, this.allCityOptions);
  }
  selectDestination(dest: string) {
    this.form.patchValue({ destination: dest });
    this.selectedDestText = dest;
    this.filteredDestinations = [];
  }
  swapLocations() {
    const tempCode = this.form.value.origin;
    const tempText = this.selectedOriginText;
    this.form.patchValue({ origin: this.form.value.destination, destination: tempCode });
    this.selectedOriginText = this.selectedDestText;
    this.selectedDestText = tempText;
    if(this.form.value.origin) this.selectOrigin(this.form.value.origin); 
  }

  private matchCities(text: string, options: string[]): string[] {
    const q = text.toLowerCase().trim();
    return options
      .filter(city => city && city.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStarts = a.toLowerCase().startsWith(q) ? 0 : 1;
        const bStarts = b.toLowerCase().startsWith(q) ? 0 : 1;
        return aStarts - bStarts || a.localeCompare(b);
      })
      .slice(0, 12);
  }

  setTripType(type: 'ONE_WAY' | 'ROUND_TRIP') {
    this.tripType = type;
    this.form.patchValue({ tripType: type });
    if (type === 'ONE_WAY') this.form.patchValue({ returnDate: null });
    this.calculatePrice();
  }

  searchFlights() {
    const origin = this.form.value.origin || this.selectedOriginText;
    const destination = this.form.value.destination || this.selectedDestText;
    const selectedDate = this.normalizeDate(this.form.value.departureDate);

    if (!origin || !destination) { 
      alert("Select Origin & Destination"); 
      return; 
    }
    if (!selectedDate) {
      alert("Select Departure Date");
      return;
    }

    // Patch into form so filtering works
    this.form.patchValue({ origin, destination });

    this.filteredFlights = this.bookableFlights.filter(
      f => f.origin === origin &&
        f.destination === destination &&
        this.normalizeDate(f.departureDate) === selectedDate
    );
    this.showResults = true;
  }

  // --- FLIGHT SELECTION & PRICE CALC ---
  selectFlight(flight: any) {
    if (!this.isFlightBookable(flight)) {
      alert('This flight is no longer available for booking.');
      return;
    }

    // 1. Get Base Price from DB (Assuming it's Economy Price)
    const basePriceFromDB = flight.economyPrice || flight.basePrice || 0; 
    
    this.form.patchValue({
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      baseFare: basePriceFromDB, 
      totalDistance: flight.distance || 0,
      seatNumber: ''
    });
    this.selectedSeats = [];
    this.seatSelectionError = '';
    this.calculatePrice();
  }

  calculatePrice() {
    const finalBasePrice = this.getSelectedClassFare();
    const adultFareTotal = finalBasePrice * this.adults;
    const childFareTotal = finalBasePrice * 0.75 * this.children;
    const infantFareTotal = finalBasePrice * 0.10 * this.infants;
    const tripMultiplier = this.tripType === 'ROUND_TRIP' ? 2 : 1;
    const passengerFareTotal = (adultFareTotal + childFareTotal + infantFareTotal) * tripMultiplier;
    const taxAmount = passengerFareTotal * this.getTaxRate();
    const baggageFee = this.calculateBaggageFee();
    const specialServiceFee = this.calculateSpecialServiceFee();
    const subtotal = passengerFareTotal + taxAmount + baggageFee + specialServiceFee;
    const couponDiscount = this.calculateCouponDiscount(subtotal);
    const loyaltyDiscount = this.form.value.loyaltyDiscount || 0;
    const grandTotal = Math.max(subtotal - couponDiscount - loyaltyDiscount, 0);

    // Update Form
    this.form.patchValue({
      tripType: this.tripType,
      returnDate: this.tripType === 'ROUND_TRIP' ? this.form.value.returnDate : null,
      adultCount: this.adults,
      childCount: this.children,
      infantCount: this.infants,
      adultFareTotal: this.round2(adultFareTotal * tripMultiplier),
      childFareTotal: this.round2(childFareTotal * tripMultiplier),
      infantFareTotal: this.round2(infantFareTotal * tripMultiplier),
      passengerFareTotal: this.round2(passengerFareTotal),
      baggageFee: this.round2(baggageFee),
      specialServiceFee: this.round2(specialServiceFee),
      subTotalBeforeDiscount: this.round2(subtotal),
      tax: this.round2(taxAmount),
      couponDiscount,
      discount: couponDiscount + loyaltyDiscount,
      totalPrice: this.round2(grandTotal),
      grandTotal: this.round2(grandTotal),
      specialServices: this.selectedSpecialServices.join(', ')
    }, { emitEvent: false });
  }

  getSelectedClassFare(): number {
    const flight = this.allFlights.find(f => Number(f.id) === Number(this.form.value.flightId));
    const baseFare = flight?.economyPrice || flight?.basePrice || this.form.value.baseFare || 0;
    const selectedClass = this.form.value.classType;
    if (selectedClass === 'PREMIUM') return flight?.premiumPrice || baseFare * 1.5;
    if (selectedClass === 'BUSINESS') return flight?.businessPrice || baseFare * 2.5;
    if (selectedClass === 'FIRST_CLASS') return flight?.firstClassPrice || baseFare * 4;
    const multiplier = this.classMultipliers[selectedClass] || 1;
    return baseFare * multiplier;
  }

  getTaxRate(): number {
    const selectedClass = this.form.value.classType;
    return selectedClass === 'BUSINESS' || selectedClass === 'FIRST_CLASS' ? 0.15 : 0.10;
  }

  calculateBaggageFee(): number {
    const selectedClass = this.form.value.classType;
    const allowanceKg = selectedClass === 'BUSINESS' || selectedClass === 'FIRST_CLASS' ? 35 : 25;
    const checkedWeight = Number(this.form.value.checkedWeightKg || 0);
    const excessKg = Math.max(checkedWeight - allowanceKg, 0);
    return excessKg * 15;
  }

  getBaggageAllowanceKg(): number {
    const selectedClass = this.form.value.classType;
    return selectedClass === 'BUSINESS' || selectedClass === 'FIRST_CLASS' ? 35 : 25;
  }

  calculateSpecialServiceFee(): number {
    return this.selectedSpecialServices.reduce((sum, service) => sum + (this.specialServiceFees[service] || 0), 0);
  }

  toggleSpecialService(service: string, checked: boolean) {
    if (checked && !this.selectedSpecialServices.includes(service)) {
      this.selectedSpecialServices.push(service);
    }
    if (!checked) {
      this.selectedSpecialServices = this.selectedSpecialServices.filter(item => item !== service);
    }
    this.calculatePrice();
  }

  isSpecialServiceSelected(service: string): boolean {
    return this.selectedSpecialServices.includes(service);
  }

  round2(value: number): number {
    return Math.round((value || 0) * 100) / 100;
  }

  calculateCouponDiscount(subtotal: number): number {
    if (!this.selectedCoupon) return this.form.value.couponDiscount || 0;
    let discount = 0;
    if (this.selectedCoupon.discountType === 'PERCENTAGE') {
      discount = subtotal * (this.selectedCoupon.discountValue || 0) / 100;
    } else {
      discount = this.selectedCoupon.discountValue || 0;
    }
    if (this.selectedCoupon.maximumDiscountAmount) {
      discount = Math.min(discount, this.selectedCoupon.maximumDiscountAmount);
    }
    return Math.min(Math.round(discount * 100) / 100, subtotal);
  }

  loadCouponSuggestions(text: string) {
    if (!text) {
      this.couponSuggestions = [];
      this.selectedCoupon = null;
      this.form.patchValue({ couponDiscount: 0 });
      this.couponMessage = '';
      this.calculatePrice();
      return;
    }
    this.couponService.getAll('ACTIVE', text).subscribe({
      next: data => this.couponSuggestions = (data || []).slice(0, 5),
      error: () => this.couponSuggestions = []
    });
  }

  selectCoupon(coupon: Coupon) {
    this.form.patchValue({ couponCode: coupon.code });
    this.couponSuggestions = [];
    this.applyCoupon();
  }

  applyCoupon() {
    const code = this.form.value.couponCode;
    if (!code) return;
    this.calculatePrice();
    const subtotal = (this.form.value.passengerFareTotal || 0) + (this.form.value.tax || 0) + (this.form.value.baggageFee || 0) + (this.form.value.specialServiceFee || 0);
    const route = `${this.form.value.origin} to ${this.form.value.destination}`;
    this.couponService.validate(code, subtotal, route, this.form.value.classType).subscribe({
      next: res => {
        this.selectedCoupon = res.valid && res.coupon ? res.coupon : null;
        this.form.patchValue({ couponDiscount: res.valid ? res.discountAmount : 0 });
        this.couponMessage = res.message;
        this.calculatePrice();
      },
      error: () => {
        this.couponMessage = 'Coupon validation failed.';
        this.form.patchValue({ couponDiscount: 0 });
        this.calculatePrice();
      }
    });
  }

  loadLoyaltySuggestions(text: string) {
    if (!text) {
      this.loyaltySuggestions = [];
      this.selectedLoyalty = null;
      this.loyaltyMessage = '';
      return;
    }
    this.loyaltyService.autocomplete(text).subscribe({
      next: data => this.loyaltySuggestions = (data || []).slice(0, 5),
      error: () => this.loyaltySuggestions = []
    });
  }

  selectLoyalty(account: LoyaltyAccount) {
    this.selectedLoyalty = account;
    this.form.patchValue({ loyaltyMemberNumber: account.memberNumber });
    this.loyaltySuggestions = [];
    this.applyLoyaltyPoints();
  }

  applyLoyaltyPoints() {
    const points = Number(this.form.value.loyaltyPointsUsed || 0);
    const member = this.form.value.loyaltyMemberNumber;
    if (!member || points <= 0) {
      this.form.patchValue({ loyaltyDiscount: 0 });
      this.loyaltyMessage = '';
      this.calculatePrice();
      return;
    }
    const applyDiscount = (account: LoyaltyAccount) => {
      const usable = Math.min(points, account.availablePoints || 0);
      const rounded = Math.floor(usable / 100) * 100;
      const discount = rounded / 100;
      this.form.patchValue({ loyaltyPointsUsed: rounded, loyaltyDiscount: discount });
      this.loyaltyMessage = `${rounded} points applied from ${account.tier} member ${account.memberNumber}.`;
      this.calculatePrice();
    };
    if (this.selectedLoyalty && this.selectedLoyalty.memberNumber === member) {
      applyDiscount(this.selectedLoyalty);
    } else {
      this.loyaltyService.getByMemberNumber(member).subscribe({
        next: account => { this.selectedLoyalty = account; applyDiscount(account); },
        error: () => {
          this.form.patchValue({ loyaltyDiscount: 0 });
          this.loyaltyMessage = 'Loyalty member was not found.';
          this.calculatePrice();
        }
      });
    }
  }

  // --- PASSENGER LOGIC ---
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.search-field')) { this.filteredOrigins = []; this.filteredDestinations = []; }
    if (!event.target.closest('.passenger-selector')) { this.showPassengerDropdown = false; }
  }
  updatePassengerCount(type: string, action: 'add' | 'remove') {
    if (type === 'adult') action === 'add' ? this.adults++ : (this.adults > 1 && this.adults--);
    if (type === 'child') action === 'add' ? this.children++ : (this.children > 0 && this.children--);
    if (type === 'infant') action === 'add' ? this.infants++ : (this.infants > 0 && this.infants--);
    this.syncAdditionalPassengerFields();
    this.syncSelectedSeatsWithPassengerCount();
    this.calculatePrice();
  }
  getTotalPassengers(): string { let t = this.adults + this.children + this.infants; return `${t} Pax`; }
  getRequiredSeatCount(): number { return this.adults + this.children; }

  private syncAdditionalPassengerFields(savedJson?: string) {
    const savedMap = this.getSavedExtraPassengerMap(savedJson);
    const existingMap = new Map(this.additionalPassengerFields.map(field => [field.key, field.name]));
    const nextFields: ExtraPassengerField[] = [];

    for (let serial = 2; serial <= this.adults; serial++) {
      this.pushExtraPassengerField(nextFields, 'ADULT', serial, `Adult Passenger ${serial} Name`, existingMap, savedMap);
    }
    for (let serial = 1; serial <= this.children; serial++) {
      this.pushExtraPassengerField(nextFields, 'CHILD', serial, `Child Passenger ${serial} Name`, existingMap, savedMap);
    }
    for (let serial = 1; serial <= this.infants; serial++) {
      this.pushExtraPassengerField(nextFields, 'INFANT', serial, `Infant Passenger ${serial} Name`, existingMap, savedMap);
    }

    this.additionalPassengerFields = nextFields;
    this.extraPassengerError = '';
    this.patchExtraPassengerNames();
  }

  private pushExtraPassengerField(
    target: ExtraPassengerField[],
    type: ExtraPassengerType,
    serial: number,
    label: string,
    existingMap: Map<string, string>,
    savedMap: Map<string, string>
  ) {
    const key = `${type}-${serial}`;
    target.push({
      type,
      serial,
      label,
      key,
      name: existingMap.get(key) || savedMap.get(key) || ''
    });
  }

  private getSavedExtraPassengerMap(savedJson?: string): Map<string, string> {
    const savedMap = new Map<string, string>();
    if (!savedJson) return savedMap;
    try {
      const parsed = JSON.parse(savedJson);
      if (Array.isArray(parsed)) {
        parsed.forEach(item => {
          const type = String(item?.type || '').toUpperCase();
          const serial = Number(item?.serial || 0);
          const name = String(item?.name || '').trim();
          if (type && serial && name) savedMap.set(`${type}-${serial}`, name);
        });
      }
    } catch (err) {
      console.warn('Could not parse saved extra passenger names', err);
    }
    return savedMap;
  }

  onExtraPassengerNameChange() {
    this.extraPassengerError = '';
    this.patchExtraPassengerNames();
  }

  private buildExtraPassengerNamesJson(): string {
    const names = this.additionalPassengerFields
      .map(field => ({
        type: field.type,
        serial: field.serial,
        name: (field.name || '').trim()
      }))
      .filter(item => item.name);
    return names.length ? JSON.stringify(names) : '';
  }

  private patchExtraPassengerNames() {
    if (!this.form) return;
    this.form.patchValue({ extraPassengerNames: this.buildExtraPassengerNamesJson() }, { emitEvent: false });
  }

  private validateExtraPassengerNames(): boolean {
    const missing = this.additionalPassengerFields.find(field => !(field.name || '').trim());
    if (!missing) {
      this.extraPassengerError = '';
      return true;
    }
    this.extraPassengerError = `${missing.label} is required.`;
    return false;
  }

  // --- SEAT MODAL LOGIC ---
  openSeatModal() { 
    const selectedFlight = this.allFlights.find(f => Number(f.id) === Number(this.form.value.flightId));
    if (selectedFlight && !this.isFlightBookable(selectedFlight)) {
      alert('This flight is no longer available for booking.');
      return;
    }
    if (!this.getSelectedCabinClass()) {
      this.seatSelectionError = 'Please select cabin class before choosing a seat.';
      alert(this.seatSelectionError);
      return;
    }
    if (this.form.value.flightId) this.isSeatModalOpen = true; 
  }
  closeSeatModal() { this.isSeatModalOpen = false; }
  
  onSeatSelected(seats: string[] | string) {
    const incomingSeats = Array.isArray(seats) ? seats : this.parseSeatNumbers(seats);
    const allowedSeats = incomingSeats.filter(seat => this.isSeatInSelectedClass(seat));
    this.selectedSeats = allowedSeats;
    this.syncSelectedSeatsWithPassengerCount();
    this.seatSelectionError = incomingSeats.length !== allowedSeats.length
      ? 'Select a seat from your chosen cabin class.'
      : '';
    if (this.selectedSeats.length === this.getRequiredSeatCount()) {
      this.isSeatModalOpen = false;
    }
  }

  getSelectedCabinClass(): string {
    return String(this.form?.value?.classType || '').trim().toUpperCase();
  }

  getSeatCabinClass(seatNumber: string): string {
    const row = Number(String(seatNumber || '').match(/\d+/)?.[0] || 0);
    if (row >= 1 && row <= 2) return 'FIRST_CLASS';
    if (row >= 3 && row <= 5) return 'BUSINESS';
    if (row >= 6 && row <= 10) return 'PREMIUM';
    if (row >= 11 && row <= 20) return 'ECONOMY';
    return '';
  }

  isSeatInSelectedClass(seatNumber: string): boolean {
    const selectedClass = this.getSelectedCabinClass();
    return !!selectedClass && this.getSeatCabinClass(seatNumber) === selectedClass;
  }

  private syncSelectedSeatsWithPassengerCount() {
    const requiredSeats = this.getRequiredSeatCount();
    if (this.selectedSeats.length > requiredSeats) {
      this.selectedSeats = this.selectedSeats.slice(0, requiredSeats);
    }
    this.form.patchValue({ seatNumber: this.selectedSeats.join(',') }, { emitEvent: false });
  }

  private parseSeatNumbers(value: string | undefined): string[] {
    if (!value) return [];
    return value.split(',').map(seat => seat.trim()).filter(Boolean);
  }

  private isFlightBookable(flight: any): boolean {
    if (!flight) return false;
    const status = String(flight.status || '').trim().toUpperCase();
    if (['CANCELLED', 'LANDED', 'DEPARTED', 'COMPLETED'].includes(status)) return false;

    const departure = this.getFlightDepartureDateTime(flight);
    if (!departure) return false;

    const minimumBookableTime = new Date(Date.now() + 30 * 60 * 1000);
    return departure.getTime() > minimumBookableTime.getTime();
  }

  private getFlightDepartureDateTime(flight: any): Date | null {
    if (!flight?.departureDate || !flight?.departureTime) return null;
    const time = String(flight.departureTime).split('.')[0];
    const parsed = new Date(`${flight.departureDate}T${time}`);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  normalizeDate(value: any): string {
    if (!value) return '';

    if (value instanceof Date) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    const text = String(value).trim();
    if (text.includes('T')) {
      return text.split('T')[0];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text;
    }

    const slashParts = text.split('/');
    if (slashParts.length === 3) {
      const [month, day, year] = slashParts;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    return text;
  }

  formatFlightDate(value: any): string {
    const normalized = this.normalizeDate(value);
    if (!normalized) return 'N/A';
    const [year, month, day] = normalized.split('-').map(Number);
    if (!year || !month || !day) return String(value || 'N/A');
    return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  shouldShowArrivalDate(flight: any): boolean {
    return !!flight?.arrivalDate &&
      this.normalizeDate(flight.arrivalDate) !== this.normalizeDate(flight.departureDate);
  }

  private validateSeatSelection(): boolean {
    const requiredSeats = this.getRequiredSeatCount();
    const invalidClassSeat = this.selectedSeats.find(seat => !this.isSeatInSelectedClass(seat));
    if (invalidClassSeat) {
      this.seatSelectionError = 'Only seats from the selected cabin class are available.';
      return false;
    }
    if (this.selectedSeats.length === requiredSeats) {
      this.seatSelectionError = '';
      return true;
    }
    this.seatSelectionError = `Please select ${requiredSeats} seat${requiredSeats === 1 ? '' : 's'} for ${requiredSeats} passenger${requiredSeats === 1 ? '' : 's'}.`;
    return false;
  }
  
  // --- SUBMIT LOGIC ---
  onSubmit() {
    this.submitError = '';
    this.extraPassengerError = '';
    this.seatSelectionError = '';
    if (this.form.invalid) { 
      this.form.markAllAsTouched();
      alert("Please fill all required fields."); 
      return; 
    }

    if (!this.validateExtraPassengerNames()) {
      alert(this.extraPassengerError);
      return;
    }

    if (!this.validateSeatSelection()) {
      alert(this.seatSelectionError);
      return;
    }

    this.calculatePrice();
    this.patchExtraPassengerNames();
    this.syncSelectedSeatsWithPassengerCount();
    const data: Booking = {
      ...this.form.value,
      passengerId: this.form.value.passengerId || null,
      tripType: this.tripType,
      returnDate: this.tripType === 'ROUND_TRIP' ? this.form.value.returnDate : null,
      adultCount: this.adults,
      childCount: this.children,
      infantCount: this.infants,
      seatNumber: this.selectedSeats.join(','),
      extraPassengerNames: this.form.value.extraPassengerNames,
      specialServices: this.selectedSpecialServices.join(', '),
      baggageFee: this.form.value.baggageFee || 0,
      specialServiceFee: this.form.value.specialServiceFee || 0,
      status: this.isEdit ? this.form.value.status : 'PENDING_REVIEW',
      paymentStatus: this.isEdit ? this.form.value.paymentStatus : 'PENDING',
      paymentMethod: this.isEdit ? this.form.value.paymentMethod : 'PENDING'
    };
    
    // Call Service
    const operation = this.isEdit 
      ? this.bookingService.update(this.id!, data) 
      : this.bookingService.create(data);

    this.submitting = true;
    operation.subscribe({
      next: (savedBooking) => {
        if (this.isEdit) {
          this.submitting = false;
          alert('Booking Updated!');
          this.router.navigate(['/booking']);
          return;
        }

        this.createLinkedAddOnCases(savedBooking || data).subscribe(warnings => {
          this.submitting = false;
          const warningText = warnings.length ? `\n\nWarning: ${warnings.join(' ')}` : '';
          alert(`Booking submitted for admin review.${warningText}`);
          this.router.navigate(['/booking/approval']);
        });
      },
      error: (err) => {
        this.submitting = false;
        console.error(err);
        this.submitError = err?.error?.message || err?.error?.error || 'Error saving booking. Please check the required fields and try again.';
        alert(this.submitError);
      }
    });
  }

  private createLinkedAddOnCases(savedBooking: Booking): Observable<string[]> {
    const requests: Observable<string | null>[] = [];
    const baggagePayload = this.buildBaggageSupportPayload(savedBooking);
    const assistancePayload = this.buildSpecialAssistancePayload(savedBooking);

    if (baggagePayload) {
      requests.push(
        this.airportOperationsService.createBaggageCase(baggagePayload).pipe(
          map(() => null),
          catchError(err => {
            console.error('Baggage support case creation failed', err);
            return of('Baggage support case could not be created automatically.');
          })
        )
      );
    }

    if (assistancePayload) {
      requests.push(
        this.airportOperationsService.createAssistanceRequest(assistancePayload).pipe(
          map(() => null),
          catchError(err => {
            console.error('Special assistance request creation failed', err);
            return of('Special assistance request could not be created automatically.');
          })
        )
      );
    }

    if (!requests.length) return of([]);
    if (requests.length === 1) {
      return requests[0].pipe(map(result => result ? [result] : []));
    }
    return forkJoin(requests).pipe(map(results => results.filter((item): item is string => !!item)));
  }

  private buildBaggageSupportPayload(savedBooking: Booking): BaggageSupportCase | null {
    const checkedBags = Number(savedBooking.checkedBags ?? this.form.value.checkedBags ?? 0);
    const checkedWeightKg = Number(savedBooking.checkedWeightKg ?? this.form.value.checkedWeightKg ?? 0);
    const cabinWeightKg = Number(savedBooking.cabinWeightKg ?? this.form.value.cabinWeightKg ?? 0);
    const estimatedFee = Number(savedBooking.baggageFee ?? this.form.value.baggageFee ?? 0);
    const allowanceKg = this.getBaggageAllowanceKg();
    const excessKg = Math.max(checkedWeightKg - allowanceKg, 0);

    if (checkedBags <= 0 && checkedWeightKg <= 0 && cabinWeightKg <= 0 && estimatedFee <= 0) {
      return null;
    }

    return {
      bookingId: savedBooking.id,
      bookingReference: savedBooking.bookingReference || this.form.value.bookingReference,
      passengerName: savedBooking.passengerName || this.form.value.passengerName,
      passengerEmail: savedBooking.email || this.form.value.email,
      flightNumber: savedBooking.flightNumber || this.form.value.flightNumber,
      route: this.getBookingRoute(savedBooking),
      departureDate: savedBooking.departureDate || this.form.value.departureDate,
      issueType: 'EXTRA_BAGGAGE',
      checkedBags,
      checkedWeightKg,
      cabinWeightKg,
      allowanceKg,
      excessKg,
      estimatedFee,
      status: 'OPEN',
      notes: 'Created automatically from booking baggage add-on.'
    };
  }

  private buildSpecialAssistancePayload(savedBooking: Booking): SpecialAssistanceRequest | null {
    const services = (savedBooking.specialServices || this.selectedSpecialServices.join(', ') || '').trim();
    if (!services) return null;

    return {
      bookingId: savedBooking.id,
      bookingReference: savedBooking.bookingReference || this.form.value.bookingReference,
      passengerName: savedBooking.passengerName || this.form.value.passengerName,
      passengerEmail: savedBooking.email || this.form.value.email,
      passengerPhone: savedBooking.phone || this.form.value.phone,
      flightNumber: savedBooking.flightNumber || this.form.value.flightNumber,
      route: this.getBookingRoute(savedBooking),
      departureDate: savedBooking.departureDate || this.form.value.departureDate,
      services,
      priority: services.includes('Medical Support') ? 'HIGH' : 'NORMAL',
      contactPreference: savedBooking.phone || this.form.value.phone ? 'PHONE' : 'EMAIL',
      notes: savedBooking.specialServiceNotes || this.form.value.specialServiceNotes || 'Created automatically from booking special services.',
      status: 'OPEN'
    };
  }

  private getBookingRoute(savedBooking: Booking): string {
    const origin = savedBooking.origin || this.form.value.origin || this.selectedOriginText;
    const destination = savedBooking.destination || this.form.value.destination || this.selectedDestText;
    return `${origin || 'N/A'} to ${destination || 'N/A'}`;
  }
}
