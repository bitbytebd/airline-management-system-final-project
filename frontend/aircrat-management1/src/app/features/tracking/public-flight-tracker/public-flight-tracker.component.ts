import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Booking } from 'src/app/core/models/booking.model';
import { LiveMapFlight } from 'src/app/core/models/flight-status.model';
import { BookingService } from 'src/app/core/services/booking.service';
import { TrackingService } from 'src/app/core/services/tracking.service';
import { environment } from 'src/environments/environment';

declare const google: any;

@Component({
  selector: 'app-public-flight-tracker',
  templateUrl: './public-flight-tracker.component.html',
  styleUrls: ['./public-flight-tracker.component.css']
})
export class PublicFlightTrackerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('publicMapCanvas') publicMapCanvas?: ElementRef<HTMLDivElement>;

  searchText = '';
  loading = false;
  message = '';
  mapMessage = '';
  googleMapsReady = false;
  liveFlights: LiveMapFlight[] = [];
  selectedFlight: LiveMapFlight | null = null;
  passengerBooking: Booking | null = null;
  suggestions: LiveMapFlight[] = [];
  showSuggestions = false;

  private map: any;
  private infoWindow: any;
  private aircraftMarker: any;
  private originMarker: any;
  private destinationMarker: any;
  private routeLine: any;
  private refreshTimer: any;
  private readonly refreshMs = 15000;

  constructor(private trackingService: TrackingService, private bookingService: BookingService) { }

  ngOnInit(): void {
    this.loadLiveFlights();
    this.refreshTimer = setInterval(() => this.refreshSelectedFlight(), this.refreshMs);
  }

  ngAfterViewInit(): void {
    this.initializeGoogleMap();
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.clearMapObjects();
  }

  loadLiveFlights(): void {
    this.trackingService.getPremiumLive().subscribe(data => {
      this.liveFlights = (data || [])
        .map(item => this.normalizeFlight(item))
        .filter(item => this.isValidCoordinate(item.currentLatitude, item.currentLongitude));
      this.refreshSuggestions(false);
      if (this.selectedFlight) {
        const updated = this.liveFlights.find(item => item.flightId === this.selectedFlight?.flightId);
        if (updated) this.showFlight(updated);
      }
    });
  }

  searchFlight(): void {
    const query = this.searchText.trim();
    this.message = '';
    this.passengerBooking = null;
    this.showSuggestions = false;
    if (!query) {
      this.message = 'Enter a flight number or booking reference.';
      return;
    }

    const directFlight = this.findLiveFlight(query);
    if (directFlight) {
      this.loadHybridFlight(directFlight);
      return;
    }

    this.loading = true;
    this.bookingService.getByReference(query).subscribe({
      next: booking => {
        this.passengerBooking = booking;
        const liveFlight = this.liveFlights.find(item =>
          item.flightId === booking.flightId ||
          String(item.flightNumber || '').toLowerCase() === String(booking.flightNumber || '').toLowerCase()
        );
        if (liveFlight) {
          this.loadHybridFlight(liveFlight);
          this.message = '';
        } else {
          this.selectedFlight = this.bookingFallbackFlight(booking);
          this.renderMap();
          this.message = 'Booking found. Live aircraft position is not available yet for this flight.';
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.message = 'No public tracking result found for this search.';
      }
    });
  }

  refreshSuggestions(show: boolean = true): void {
    const query = this.searchText.trim().toLowerCase();
    this.suggestions = query
      ? this.liveFlights.filter(item =>
          [item.flightNumber, item.origin, item.destination, item.flightStatus, item.status]
            .some(value => String(value || '').toLowerCase().includes(query))
        ).slice(0, 6)
      : [];
    this.showSuggestions = show && this.suggestions.length > 0;
  }

  selectSuggestion(item: LiveMapFlight): void {
    this.searchText = item.flightNumber;
    this.showSuggestions = false;
    this.loadHybridFlight(item);
  }

  showFlight(flight: LiveMapFlight): void {
    this.selectedFlight = this.normalizeFlight(flight);
    this.message = '';
    this.renderMap();
  }

  loadHybridFlight(flight: LiveMapFlight): void {
    if (!flight.flightId) {
      this.showFlight(flight);
      return;
    }
    this.loading = true;
    this.trackingService.getHybridLive(flight.flightId).subscribe({
      next: data => {
        this.showFlight(data);
        this.loading = false;
      },
      error: () => {
        this.showFlight(flight);
        this.loading = false;
      }
    });
  }

  refreshSelectedFlight(): void {
    this.trackingService.getPremiumLive().subscribe(data => {
      this.liveFlights = (data || [])
        .map(item => this.normalizeFlight(item))
        .filter(item => this.isValidCoordinate(item.currentLatitude, item.currentLongitude));
      if (!this.selectedFlight) return;
      const updated = this.liveFlights.find(item => item.flightId === this.selectedFlight?.flightId);
      if (updated) this.loadHybridFlight(updated);
    });
  }

  trackingModeLabel(item?: LiveMapFlight | null): string {
    const mode = String(item?.trackingMode || '').toUpperCase();
    if (mode === 'LIVE_API' || mode === 'LIVE_GPS') return 'LIVE GPS';
    if (mode === 'SIMULATED_ROUTE') return 'SIMULATED ROUTE';
    return 'MANUAL';
  }

  trackingModeClass(item?: LiveMapFlight | null): string {
    return this.trackingModeLabel(item).toLowerCase().replace(/\s+/g, '-');
  }

  statusClass(status?: string): string {
    return String(status || '').toLowerCase().replace('_', '-');
  }

  formatDate(value?: string): string {
    return value ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'TBA';
  }

  formatDuration(minutes?: number): string {
    if (minutes === null || minutes === undefined || isNaN(Number(minutes))) return 'TBA';
    const total = Math.max(0, Math.round(Number(minutes)));
    const days = Math.floor(total / 1440);
    const hours = Math.floor((total % 1440) / 60);
    const mins = total % 60;
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  }

  formatDistance(value?: number): string {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
    return `${Math.round(Number(value)).toLocaleString('en-US')} km`;
  }

  formatAltitude(value?: number): string {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
    return `${Math.round(Number(value)).toLocaleString('en-US')} ft`;
  }

  formatSpeed(value?: number): string {
    if (value === null || value === undefined || isNaN(Number(value))) return 'N/A';
    return `${Math.round(Number(value)).toLocaleString('en-US')} km/h`;
  }

  formatProgress(value?: number): string {
    if (value === null || value === undefined || isNaN(Number(value))) return '0%';
    return `${Math.round(Number(value))}%`;
  }

  formatCoordinate(value?: number): string {
    return typeof value === 'number' && !isNaN(value) ? value.toFixed(4) : 'N/A';
  }

  isValidCoordinate(lat?: number, lng?: number): boolean {
    return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
  }

  hasRouteCoordinates(item?: LiveMapFlight | null): boolean {
    return !!item && this.isValidCoordinate(item.originLatitude, item.originLongitude)
      && this.isValidCoordinate(item.destinationLatitude, item.destinationLongitude);
  }

  private findLiveFlight(query: string): LiveMapFlight | null {
    const normalized = query.toLowerCase();
    return this.liveFlights.find(item => String(item.flightNumber || '').toLowerCase() === normalized) || null;
  }

  private normalizeFlight(item: LiveMapFlight): LiveMapFlight {
    return {
      ...item,
      flightStatus: item.flightStatus || item.status || 'SCHEDULED',
      status: item.status || item.flightStatus || 'SCHEDULED',
      currentLatitude: this.toNumber(item.currentLatitude),
      currentLongitude: this.toNumber(item.currentLongitude),
      originLatitude: this.toOptionalNumber(item.originLatitude),
      originLongitude: this.toOptionalNumber(item.originLongitude),
      destinationLatitude: this.toOptionalNumber(item.destinationLatitude),
      destinationLongitude: this.toOptionalNumber(item.destinationLongitude),
      altitudeFt: this.toNumber(item.altitudeFt),
      speedKmh: this.toNumber(item.speedKmh),
      headingDegree: this.toNumber(item.headingDegree),
      progressPercent: Math.max(0, Math.min(100, this.toNumber(item.progressPercent))),
      estimatedLandingMinutes: this.toNumber(item.estimatedLandingMinutes),
      remainingDistanceKm: this.toNumber(item.remainingDistanceKm || item.distanceRemainingKm),
      distanceRemainingKm: this.toNumber(item.distanceRemainingKm || item.remainingDistanceKm),
      delayMinutes: this.toNumber(item.delayMinutes),
      trackingMode: item.trackingMode || 'MANUAL'
    };
  }

  private toNumber(value: any): number {
    const parsed = Number(value);
    return isNaN(parsed) ? 0 : parsed;
  }

  private toOptionalNumber(value: any): number | undefined {
    const parsed = Number(value);
    return isNaN(parsed) ? undefined : parsed;
  }

  private bookingFallbackFlight(booking: Booking): LiveMapFlight {
    return {
      flightId: booking.flightId,
      flightNumber: booking.flightNumber,
      origin: booking.origin,
      destination: booking.destination,
      flightStatus: 'SCHEDULED',
      status: 'SCHEDULED',
      currentLatitude: 0,
      currentLongitude: 0,
      progressPercent: 0,
      estimatedLandingMinutes: 0,
      trackingMode: 'MANUAL'
    };
  }

  private initializeGoogleMap(): void {
    const key = this.getGoogleMapsKey();
    if (!key) {
      this.googleMapsReady = false;
      this.mapMessage = 'Google Maps API key is not configured. Tracking data is still available.';
      return;
    }
    this.prepareGoogleMapsAuthFailure();
    if ((window as any).google?.maps) {
      this.createMap();
      return;
    }
    const existing = document.querySelector('script[data-skyward-google-maps="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => this.createMap());
      existing.addEventListener('error', () => this.showMapLoadFailure());
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.dataset['skywardGoogleMaps'] = 'true';
    script.onload = () => this.createMap();
    script.onerror = () => this.showMapLoadFailure();
    document.head.appendChild(script);
  }

  private getGoogleMapsKey(): string {
    const key = String(environment.googleMapsApiKey || (window as any).GOOGLE_MAPS_API_KEY || localStorage.getItem('GOOGLE_MAPS_API_KEY') || '').trim();
    return key === 'YOUR_REAL_GOOGLE_MAPS_API_KEY' || key === 'PASTE_YOUR_GOOGLE_MAPS_API_KEY_HERE' ? '' : key;
  }

  private createMap(): void {
    if (!this.publicMapCanvas?.nativeElement || !(window as any).google?.maps) return;
    this.map = new google.maps.Map(this.publicMapCanvas.nativeElement, {
      center: { lat: 20, lng: 0 },
      zoom: 2,
      minZoom: 2,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      mapTypeId: 'roadmap',
      styles: this.mapStyles()
    });
    this.infoWindow = new google.maps.InfoWindow();
    this.googleMapsReady = true;
    this.mapMessage = '';
    this.renderMap();
  }

  private renderMap(): void {
    if (!this.map || !this.selectedFlight || !(window as any).google?.maps) return;
    if (!this.isValidCoordinate(this.selectedFlight.currentLatitude, this.selectedFlight.currentLongitude)) {
      this.clearMapObjects();
      return;
    }

    const current = { lat: Number(this.selectedFlight.currentLatitude), lng: Number(this.selectedFlight.currentLongitude) };
    this.upsertAircraftMarker(current);

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(current);
    if (this.hasRouteCoordinates(this.selectedFlight)) {
      const origin = { lat: Number(this.selectedFlight.originLatitude), lng: Number(this.selectedFlight.originLongitude) };
      const destination = { lat: Number(this.selectedFlight.destinationLatitude), lng: Number(this.selectedFlight.destinationLongitude) };
      bounds.extend(origin);
      bounds.extend(destination);
      this.upsertAirportMarkers(origin, destination);
      this.upsertRouteLine([origin, current, destination]);
    }

    this.infoWindow?.setContent(this.infoWindowHtml(this.selectedFlight));
    this.infoWindow?.open(this.map, this.aircraftMarker);
    this.map.fitBounds(bounds, 80);
  }

  private upsertAircraftMarker(position: { lat: number; lng: number }): void {
    const icon = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      fillColor: '#0ea5e9',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2,
      scale: 7,
      rotation: Number(this.selectedFlight?.headingDegree || 0)
    };
    if (this.aircraftMarker) {
      this.animateMarker(this.aircraftMarker, position);
      this.aircraftMarker.setIcon(icon);
      this.aircraftMarker.setTitle(this.selectedFlight?.flightNumber || 'Aircraft');
      return;
    }
    this.aircraftMarker = new google.maps.Marker({
      position,
      map: this.map,
      title: this.selectedFlight?.flightNumber || 'Aircraft',
      icon,
      label: { text: this.selectedFlight?.flightNumber || '', color: '#082f49', fontSize: '11px', fontWeight: '700' }
    });
    this.aircraftMarker.addListener('click', () => {
      this.infoWindow?.setContent(this.infoWindowHtml(this.selectedFlight));
      this.infoWindow?.open(this.map, this.aircraftMarker);
    });
  }

  private animateMarker(marker: any, next: { lat: number; lng: number }): void {
    const previous = marker.getPosition();
    if (!previous) {
      marker.setPosition(next);
      return;
    }

    const start = { lat: previous.lat(), lng: previous.lng() };
    const steps = 16;
    let frame = 0;
    const timer = setInterval(() => {
      frame += 1;
      const ratio = frame / steps;
      marker.setPosition({
        lat: start.lat + (next.lat - start.lat) * ratio,
        lng: start.lng + (next.lng - start.lng) * ratio
      });
      if (frame >= steps) clearInterval(timer);
    }, 35);
  }

  private upsertAirportMarkers(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): void {
    this.originMarker = this.upsertAirportMarker(this.originMarker, origin, this.selectedFlight?.origin || 'Origin', '#22c55e');
    this.destinationMarker = this.upsertAirportMarker(this.destinationMarker, destination, this.selectedFlight?.destination || 'Destination', '#f97316');
  }

  private upsertAirportMarker(marker: any, position: { lat: number; lng: number }, title: string, color: string): any {
    if (marker) {
      marker.setPosition(position);
      marker.setTitle(title);
      return marker;
    }
    return new google.maps.Marker({
      position,
      map: this.map,
      title,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
        scale: 7
      }
    });
  }

  private upsertRouteLine(path: Array<{ lat: number; lng: number }>): void {
    if (this.routeLine) {
      this.routeLine.setPath(path);
      return;
    }
    this.routeLine = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#38bdf8',
      strokeOpacity: 0.9,
      strokeWeight: 4,
      map: this.map
    });
  }

  private clearMapObjects(): void {
    [this.aircraftMarker, this.originMarker, this.destinationMarker, this.routeLine].forEach(item => item?.setMap(null));
    this.aircraftMarker = null;
    this.originMarker = null;
    this.destinationMarker = null;
    this.routeLine = null;
  }

  private showMapLoadFailure(): void {
    this.googleMapsReady = false;
    this.mapMessage = 'Google Maps could not be loaded. Check the API key or network access.';
  }

  private showMapAuthFailure(): void {
    this.googleMapsReady = false;
    this.mapMessage = 'Google Maps API key invalid or restricted.';
  }

  private prepareGoogleMapsAuthFailure(): void {
    const previous = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      if (typeof previous === 'function') previous();
      this.showMapAuthFailure();
    };
  }

  private infoWindowHtml(flight: LiveMapFlight | null): string {
    if (!flight) return '';
    return `
      <div class="gm-flight-card">
        <strong>${flight.flightNumber || 'N/A'}</strong>
        <span>${flight.origin || 'N/A'} to ${flight.destination || 'N/A'}</span>
        <small>${this.trackingModeLabel(flight)} - ${flight.flightStatus || flight.status || 'N/A'}</small>
        <small>${this.formatAltitude(flight.altitudeFt)} - ${this.formatSpeed(flight.speedKmh)} - ETA ${this.formatDuration(flight.estimatedLandingMinutes)}</small>
      </div>
    `;
  }

  private mapStyles(): any[] {
    return [
      { elementType: 'geometry', stylers: [{ color: '#dff7ff' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#164e63' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#8bd9f0' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] }
    ];
  }
}
