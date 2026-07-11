import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { FlightStatusLog, LiveMapFlight } from 'src/app/core/models/flight-status.model';
import { TrackingService } from 'src/app/core/services/tracking.service';

@Component({
  selector: 'app-tracking-list',
  template: `
    <div class="tracking-map-page">
      <section class="tracking-toolbar">
        <div class="brand-block">
          <span>Skyward Live Network</span>
          <h1>World Flight Tracking</h1>
        </div>

        <div class="toolbar-control search-control">
          <i class="fas fa-search"></i>
          <input
            [(ngModel)]="searchText"
            (ngModelChange)="onSearchChange($event)"
            (keyup.enter)="focusFirstSearchResult()"
            placeholder="Search flight number, PNR, origin, destination, status">
          <button type="button" *ngIf="searchText" (click)="clearSearch()" aria-label="Clear tracking search"><i class="fas fa-times"></i></button>
        </div>

        <select class="toolbar-control" [(ngModel)]="modeFilter" (ngModelChange)="applyMapFilters(true)" aria-label="Filter by tracking mode">
          <option value="ALL">All Modes</option>
          <option value="SIMULATED_ROUTE">SIMULATED ROUTE</option>
        </select>

        <select class="toolbar-control" [(ngModel)]="statusFilter" (ngModelChange)="applyMapFilters(true)" aria-label="Filter by flight status">
          <option value="ALL">All Status</option>
          <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
        </select>

        <button type="button" class="refresh-btn" (click)="loadLiveMap(true)" [disabled]="refreshing" aria-label="Refresh live tracking data">
          <i class="fas fa-sync-alt" [class.spin]="refreshing"></i>
          {{ refreshing ? 'Refreshing' : 'Refresh' }}
        </button>
      </section>

      <section class="search-result-strip">
        <span>
          {{ searchResultMessage }}
        </span>
        <em *ngIf="searchText">Search: "{{ searchText }}"</em>
        <button type="button" *ngIf="searchText || modeFilter !== 'ALL' || statusFilter !== 'ALL'" (click)="resetFilters()">
          Clear Filters
        </button>
      </section>

      <section class="map-command-screen">
        <article class="selected-flight-card" *ngIf="selectedMapFlight">
          <div class="card-head">
            <div>
              <span>Selected Aircraft</span>
              <h2>{{ selectedMapFlight.flightNumber }}</h2>
              <p>{{ selectedMapFlight.origin || 'Origin' }} <i class="fas fa-arrow-right"></i> {{ selectedMapFlight.destination || 'Destination' }}</p>
            </div>
            <strong [ngClass]="trackingModeClass(selectedMapFlight)">{{ trackingModeLabel(selectedMapFlight) }}</strong>
          </div>

          <div class="progress-line">
            <span [style.width.%]="selectedMapFlight.progressPercent || 0"></span>
          </div>

          <div class="flight-card-grid">
            <div><span>Latitude</span><b>{{ formatCoordinate(selectedMapFlight.currentLatitude) }}</b></div>
            <div><span>Longitude</span><b>{{ formatCoordinate(selectedMapFlight.currentLongitude) }}</b></div>
            <div><span>Altitude</span><b>{{ formatAltitude(selectedMapFlight.altitudeFt) }}</b></div>
            <div><span>Speed</span><b>{{ formatSpeed(selectedMapFlight.speedKmh) }}</b></div>
            <div><span>Heading</span><b>{{ selectedMapFlight.headingDegree || 0 }} deg</b></div>
            <div><span>Progress</span><b>{{ formatProgress(selectedMapFlight.progressPercent) }}</b></div>
            <div><span>Remaining</span><b>{{ formatDistance(selectedMapFlight.remainingDistanceKm ?? selectedMapFlight.distanceRemainingKm) }}</b></div>
            <div><span>ETA</span><b>{{ formatDuration(selectedMapFlight.estimatedLandingMinutes) }}</b></div>
            <div><span>Status</span><b>{{ selectedMapFlight.flightStatus || selectedMapFlight.status || 'N/A' }}</b></div>
            <div><span>Arrival</span><b>{{ formatDate(selectedMapFlight.estimatedArrival) }}</b></div>
          </div>
          <small>Last tracked: {{ formatDate(selectedMapFlight.lastTrackedAt) }}</small>
        </article>

        <div class="map-stage">
          <div #leafletMapCanvas class="leaflet-world-map"></div>

          <button type="button" class="flight-drawer-toggle" *ngIf="filteredFlights.length" (click)="showActiveFlights = !showActiveFlights">
            <i class="fas" [ngClass]="showActiveFlights ? 'fa-eye-slash' : 'fa-list'"></i>
            {{ showActiveFlights ? 'Hide Active Flights' : 'Show Active Flights' }}
            <strong>{{ filteredFlights.length }}</strong>
          </button>

          <aside class="active-flight-drawer" *ngIf="filteredFlights.length" [class.collapsed]="!showActiveFlights">
            <div class="drawer-head">
              <span>Active Flights</span>
              <strong>{{ filteredFlights.length }}</strong>
            </div>
            <button
              type="button"
              *ngFor="let flight of filteredFlights"
              [class.selected]="selectedMapFlight?.flightId === flight.flightId"
              (click)="selectMapFlight(flight, true)">
              <span>
                <b>{{ flight.flightNumber }}</b>
                <small>{{ flight.origin }} to {{ flight.destination }}</small>
                <em *ngIf="!canPlotRoute(flight)">Route coordinates unavailable</em>
              </span>
              <i [ngClass]="trackingModeClass(flight)">{{ trackingModeLabel(flight) }}</i>
            </button>
          </aside>

          <div class="map-empty" *ngIf="!filteredFlights.length">
            <i class="fas fa-map-marker-alt"></i>
            <strong>No plottable tracking data</strong>
            <span>Routes appear here when the live tracking API returns coordinates.</span>
          </div>
        </div>
      </section>

      <section class="map-attribution">
        Map data © OpenStreetMap contributors. LIVE_GPS is shown only when returned by backend; simulated data stays labelled SIMULATED_ROUTE.
      </section>
    </div>
  `,
  styleUrls: ['./tracking-list.component.css']
})
export class TrackingListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('leafletMapCanvas') leafletMapCanvas?: ElementRef<HTMLDivElement>;

  liveMapFlights: LiveMapFlight[] = [];
  filteredFlights: LiveMapFlight[] = [];
  selectedMapFlight: LiveMapFlight | null = null;
  searchText = '';
  modeFilter = 'ALL';
  statusFilter = 'ALL';
  showActiveFlights = false;
  refreshing = false;
  searchResultMessage = 'Loading live tracking routes...';
  statuses = ['SCHEDULED', 'BOARDING', 'DEPARTED', 'EN_ROUTE', 'APPROACHING', 'DELAYED', 'DIVERTED', 'LANDED', 'CANCELLED'];

  private map?: L.Map;
  private routeLayers = new Map<number, L.LayerGroup>();
  private englishLabelLayer?: L.LayerGroup;
  private liveMapInterval: any;
  private readonly liveMapRefreshMs = 300000;
  private readonly AIRCRAFT_MARKER_ROTATION_OFFSET = 0;

  constructor(private trackingService: TrackingService, private router: Router) { }

  ngOnInit(): void {
    this.loadLiveMap();
    this.liveMapInterval = setInterval(() => this.loadLiveMap(), this.liveMapRefreshMs);
  }

  ngAfterViewInit(): void {
    this.initializeLeafletMap();
  }

  ngOnDestroy(): void {
    if (this.liveMapInterval) clearInterval(this.liveMapInterval);
    this.map?.remove();
  }

  loadLiveMap(forceFocus: boolean = false): void {
    if (this.refreshing) return;
    this.refreshing = true;
    const selectedId = this.selectedMapFlight?.flightId;
    this.trackingService.getPremiumLive().subscribe(data => {
      this.liveMapFlights = (data || []).map(item => this.normalizeLiveFlight(item));
      this.applyMapFilters(false);

      if (selectedId) {
        this.selectedMapFlight = this.filteredFlights.find(item => item.flightId === selectedId)
          || this.liveMapFlights.find(item => item.flightId === selectedId)
          || null;
      }
      if (!this.selectedMapFlight && this.filteredFlights.length) {
        this.selectedMapFlight = this.filteredFlights[0];
      }
      this.renderLeafletRoutes(forceFocus);
      this.refreshing = false;
    }, () => {
      this.searchResultMessage = 'Unable to refresh live tracking data. Please try again.';
      this.refreshing = false;
    });
  }

  applyMapFilters(resetSelection: boolean = true): void {
    const q = this.searchText.trim().toLowerCase();
    this.filteredFlights = this.liveMapFlights.filter(flight => {
      const mode = String(flight.trackingMode || '').toUpperCase();
      const status = String(flight.flightStatus || flight.status || '').toUpperCase();
      const modeOk = this.modeFilter === 'ALL' || mode === this.modeFilter || (this.modeFilter === 'LIVE_GPS' && mode === 'LIVE_API');
      const statusOk = this.statusFilter === 'ALL' || status === this.statusFilter;
      const searchOk = !q || [
        flight.flightNumber,
        flight.origin,
        flight.destination,
        flight.flightStatus,
        flight.status,
        flight.trackingMode,
        flight.trackingSource,
        flight.bookingReferences,
        `${flight.origin} to ${flight.destination}`,
        `${flight.origin} ${flight.destination}`
      ].some(value => String(value || '').toLowerCase().includes(q));
      return modeOk && statusOk && searchOk;
    });

    this.updateSearchResultMessage();

    if (resetSelection) {
      this.selectedMapFlight = this.filteredFlights[0] || null;
      this.renderLeafletRoutes(true);
    }
  }

  onSearchChange(value: string): void {
    this.searchText = value || '';
    this.applyMapFilters(true);
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyMapFilters();
  }

  focusFirstSearchResult(): void {
    if (this.filteredFlights.length) {
      this.selectMapFlight(this.filteredFlights[0], true);
    }
  }

  resetFilters(): void {
    this.searchText = '';
    this.modeFilter = 'ALL';
    this.statusFilter = 'ALL';
    this.applyMapFilters(true);
  }

  selectMapFlight(flight: LiveMapFlight, focus: boolean = true): void {
    this.selectedMapFlight = flight;
    this.renderLeafletRoutes(focus);
    setTimeout(() => this.map?.invalidateSize(), 50);
  }

  goUpdate(item?: FlightStatusLog): void { this.router.navigate(['/tracking/update'], { queryParams: item ? { flightId: item.flightId } : {} }); }
  goStatus(item?: FlightStatusLog): void { this.router.navigate(['/tracking/status'], { queryParams: item ? { flightId: item.flightId } : {} }); }

  canPlotRoute(item: LiveMapFlight): boolean {
    return this.isValidCoordinate(item.originLatitude, item.originLongitude)
      && this.isValidCoordinate(item.destinationLatitude, item.destinationLongitude);
  }

  isValidCoordinate(lat?: number, lng?: number): boolean {
    return typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng);
  }

  trackingModeLabel(item?: LiveMapFlight | null): string {
    const mode = String(item?.trackingMode || '').toUpperCase();
    if (mode === 'SIMULATED_ROUTE') return 'SIMULATED ROUTE';
    return 'SIMULATED ROUTE';
  }

  trackingModeClass(item?: LiveMapFlight | null): string {
    return this.trackingModeLabel(item).toLowerCase().replace(/\s+/g, '-');
  }

  formatCoordinate(value?: number): string {
    return typeof value === 'number' && !isNaN(value) ? value.toFixed(4) : 'N/A';
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

  formatDate(value?: string): string {
    return value ? new Date(value).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'N/A';
  }

  private initializeLeafletMap(): void {
    if (!this.leafletMapCanvas?.nativeElement || this.map) return;

    this.map = L.map(this.leafletMapCanvas.nativeElement, {
      center: [20, 0],
      zoom: 3,
      minZoom: 2,
      worldCopyJump: true,
      zoomControl: true
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
      detectRetina: true,
      updateWhenIdle: true,
      keepBuffer: 4
    }).addTo(this.map);

    setTimeout(() => this.map?.invalidateSize(), 150);
    setTimeout(() => this.map?.invalidateSize(), 500);
    this.renderLeafletRoutes(false);
  }

  private renderLeafletRoutes(fitSelected: boolean): void {
    if (!this.map) return;

    this.routeLayers.forEach(layer => layer.removeFrom(this.map!));
    this.routeLayers.clear();

    const plottable = this.filteredFlights.filter(flight => this.canPlotRoute(flight));
    const selectedId = this.selectedMapFlight?.flightId;
    const allBounds: L.LatLngExpression[] = [];

    plottable.forEach(flight => {
      const selected = flight.flightId === selectedId;
      const layer = this.createFlightLayer(flight, selected);
      layer.addTo(this.map!);
      if (selected) {
        layer.eachLayer(child => {
          const routeChild = child as unknown as { bringToFront?: () => void };
          routeChild.bringToFront?.();
        });
      }
      this.routeLayers.set(flight.flightId, layer);

      allBounds.push(
        [Number(flight.originLatitude), Number(flight.originLongitude)],
        [Number(flight.destinationLatitude), Number(flight.destinationLongitude)]
      );
      if (this.isValidCoordinate(flight.currentLatitude, flight.currentLongitude)) {
        allBounds.push([Number(flight.currentLatitude), Number(flight.currentLongitude)]);
      }
    });

    const selected = this.selectedMapFlight;
    if (fitSelected && selected && this.canPlotRoute(selected)) {
      const selectedPoints: L.LatLngExpression[] = [
        [Number(selected.originLatitude), Number(selected.originLongitude)],
        [Number(selected.destinationLatitude), Number(selected.destinationLongitude)]
      ];
      if (this.isValidCoordinate(selected.currentLatitude, selected.currentLongitude)) {
        selectedPoints.push([Number(selected.currentLatitude), Number(selected.currentLongitude)]);
      }
      const selectedBounds = L.latLngBounds(selectedPoints);
      const wideLayout = window.innerWidth > 900;
      this.map.fitBounds(selectedBounds, {
        paddingTopLeft: wideLayout ? [360, 90] : [70, 120],
        paddingBottomRight: [90, 90],
        maxZoom: 7
      });
    } else if (!selectedId && allBounds.length) {
      this.map.fitBounds(L.latLngBounds(allBounds), { padding: [70, 70], maxZoom: 5 });
    }
    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private createFlightLayer(flight: LiveMapFlight, selected: boolean): L.LayerGroup {
    const origin: L.LatLngExpression = [Number(flight.originLatitude), Number(flight.originLongitude)];
    const current: L.LatLngExpression = [Number(flight.currentLatitude), Number(flight.currentLongitude)];
    const destination: L.LatLngExpression = [Number(flight.destinationLatitude), Number(flight.destinationLongitude)];
    const hasCurrentPosition = this.isValidCoordinate(flight.currentLatitude, flight.currentLongitude);
    const routeLayers: L.Layer[] = [];

    routeLayers.push(
      L.polyline([origin, destination], {
        color: selected ? '#334155' : '#64748b',
        weight: selected ? 5 : 2,
        opacity: selected ? 0.5 : 0.16,
        dashArray: selected ? undefined : '7 8',
        lineCap: 'round',
        lineJoin: 'round',
        className: selected ? 'selected-full-route-line' : 'muted-route-line'
      })
    );

    if (hasCurrentPosition) {
      routeLayers.push(
        L.polyline([origin, current], {
          color: selected ? '#0284c7' : '#0284c7',
          weight: selected ? 8 : 2,
          opacity: selected ? 1 : 0.24,
          lineCap: 'round',
          lineJoin: 'round',
          className: selected ? 'selected-travelled-route-line' : 'muted-travelled-route-line'
        }),
        L.polyline([current, destination], {
          color: selected ? '#7c3aed' : '#7c3aed',
          weight: selected ? 6 : 2,
          opacity: selected ? 0.85 : 0.18,
          dashArray: '10 8',
          lineCap: 'round',
          lineJoin: 'round',
          className: selected ? 'selected-remaining-route-line' : 'muted-remaining-route-line'
        })
      );
    }

    const originMarker = L.marker(origin, {
      icon: this.airportIcon('origin', selected),
      zIndexOffset: selected ? 900 : 300
    })
      .bindPopup(this.popupHtml(flight, 'Origin'))
      .bindTooltip(`From: ${flight.origin || 'Origin'}`, {
        permanent: selected,
        direction: 'top',
        offset: [0, -12],
        className: 'skyward-route-tooltip origin'
      });
    const destinationMarker = L.marker(destination, {
      icon: this.airportIcon('destination', selected),
      zIndexOffset: selected ? 900 : 300
    })
      .bindPopup(this.popupHtml(flight, 'Destination'))
      .bindTooltip(`To: ${flight.destination || 'Destination'}`, {
        permanent: selected,
        direction: 'top',
        offset: [0, -12],
        className: 'skyward-route-tooltip destination'
      });
    const aircraftMarker = hasCurrentPosition
      ? L.marker(current, {
        icon: this.aircraftIcon(flight, selected),
        zIndexOffset: selected ? 1200 : 450
      }).bindPopup(this.popupHtml(flight, 'Aircraft'))
      : null;

    const layers = [...routeLayers, originMarker, destinationMarker, ...(aircraftMarker ? [aircraftMarker] : [])];
    layers.forEach(layer => {
      layer.on('click', () => this.selectMapFlight(flight, true));
    });

    return L.layerGroup(layers);
  }

  private aircraftIcon(flight: LiveMapFlight, selected: boolean): L.DivIcon {
    const heading = Number(flight.headingDegree || 0);
    const rotation = heading + this.AIRCRAFT_MARKER_ROTATION_OFFSET;
    const size = selected ? 52 : 42;
    return L.divIcon({
      className: 'skyward-aircraft-icon',
      html: `
        <div class="${selected ? 'selected' : ''}" style="transform: rotate(${rotation}deg)" aria-label="Aircraft marker">
          <svg viewBox="0 0 64 64" role="img" focusable="false">
            <path class="aircraft-shadow" d="M32 5c2.9 0 5.2 2.3 5.2 5.2v15.3l20.1 12.1c1.2.7 1.9 2 1.9 3.4v5.6L37.2 39v10.8l7.7 5.3v4.2L32 56.1 19.1 59.3v-4.2l7.7-5.3V39L4.8 46.6V41c0-1.4.7-2.7 1.9-3.4l20.1-12.1V10.2C26.8 7.3 29.1 5 32 5z"/>
            <path class="aircraft-body" d="M32 3c3.2 0 5.8 2.6 5.8 5.8v16.5l21.4 12.9c1.1.7 1.8 1.9 1.8 3.2v6.8L37.8 40v10.4l8.2 5.7v5L32 57.5 18 61.1v-5l8.2-5.7V40L3 48.2v-6.8c0-1.3.7-2.5 1.8-3.2l21.4-12.9V8.8C26.2 5.6 28.8 3 32 3z"/>
            <path class="aircraft-highlight" d="M32 6.8c1.1 0 2 .9 2 2v19L55.4 40.6 34 34.8v17.5l4.3 3-6.3-1.7-6.3 1.7 4.3-3V34.8L8.6 40.6 30 27.8v-19c0-1.1.9-2 2-2z"/>
          </svg>
        </div>
      `,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }

  private airportIcon(type: 'origin' | 'destination', selected: boolean): L.DivIcon {
    return L.divIcon({
      className: 'skyward-airport-icon',
      html: `<span class="${type} ${selected ? 'selected' : ''}"></span>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  }

  private popupHtml(flight: LiveMapFlight, title: string): string {
    return `
      <div class="tracking-popup">
        <strong>${title}: ${flight.flightNumber}</strong>
        <span>${flight.origin || 'N/A'} → ${flight.destination || 'N/A'}</span>
        <em>${this.trackingModeLabel(flight)}</em>
        <small>Status: ${flight.flightStatus || flight.status || 'N/A'}</small>
        <small>Altitude: ${this.formatAltitude(flight.altitudeFt)} | Speed: ${this.formatSpeed(flight.speedKmh)}</small>
        <small>Progress: ${this.formatProgress(flight.progressPercent)} | ETA: ${this.formatDuration(flight.estimatedLandingMinutes)}</small>
      </div>
    `;
  }

  private addEnglishMapLabels(): void {
    if (!this.map) return;
    const labels = [
      ['Canada', 57, -106], ['United States', 39, -98], ['Mexico', 23, -102], ['Brazil', -10, -52],
      ['United Kingdom', 55, -3], ['France', 47, 2], ['Germany', 51, 10], ['Spain', 40, -4],
      ['Turkey', 39, 35], ['Saudi Arabia', 24, 45], ['Iran', 32, 53], ['India', 22, 79],
      ['Bangladesh', 24, 90], ['China', 35, 104], ['Japan', 38, 138], ['South Korea', 36, 128],
      ['Thailand', 15, 101], ['Malaysia', 4, 102], ['Singapore', 1.35, 103.8], ['Indonesia', -2, 118],
      ['Australia', -25, 134], ['Egypt', 27, 30], ['South Africa', -30, 24], ['Russia', 61, 90],
      ['Mongolia', 46, 104], ['Kazakhstan', 48, 67], ['Pakistan', 30, 70], ['Afghanistan', 34, 66],
      ['United Arab Emirates', 24, 54], ['Qatar', 25.3, 51.2], ['Oman', 21, 57], ['Iraq', 33, 44],
      ['Dhaka', 23.81, 90.41], ['London', 51.5, -0.12], ['Doha', 25.28, 51.52], ['Dubai', 25.2, 55.27],
      ['Singapore', 1.35, 103.82], ['Tokyo', 35.68, 139.76], ['New York', 40.71, -74], ['Sydney', -33.86, 151.2]
    ] as Array<[string, number, number]>;

    this.englishLabelLayer?.removeFrom(this.map);
    this.englishLabelLayer = L.layerGroup(labels.map(([name, lat, lng]) =>
      L.marker([lat, lng], {
        interactive: false,
        icon: L.divIcon({
          className: 'english-map-label',
          html: `<span>${name}</span>`,
          iconSize: [120, 20],
          iconAnchor: [60, 10]
        })
      })
    )).addTo(this.map);
  }

  private updateSearchResultMessage(): void {
    if (!this.liveMapFlights.length) {
      this.searchResultMessage = 'No live tracking routes loaded yet.';
      return;
    }
    if (!this.filteredFlights.length) {
      this.searchResultMessage = `No matching route found from ${this.liveMapFlights.length} live tracking routes.`;
      return;
    }
    const routeLabel = this.filteredFlights.length === 1 ? 'route' : 'routes';
    this.searchResultMessage = `Showing ${this.filteredFlights.length} matching ${routeLabel} from ${this.liveMapFlights.length} live tracking routes.`;
  }

  private normalizeLiveFlight(item: LiveMapFlight): LiveMapFlight {
    return {
      ...item,
      flightNumber: item.flightNumber || 'N/A',
      origin: item.origin || 'N/A',
      destination: item.destination || 'N/A',
      flightStatus: item.flightStatus || item.status || 'SCHEDULED',
      status: item.status || item.flightStatus || 'SCHEDULED',
      currentLatitude: this.toOptionalNumber(item.currentLatitude) as number,
      currentLongitude: this.toOptionalNumber(item.currentLongitude) as number,
      originLatitude: this.toOptionalNumber(item.originLatitude),
      originLongitude: this.toOptionalNumber(item.originLongitude),
      destinationLatitude: this.toOptionalNumber(item.destinationLatitude),
      destinationLongitude: this.toOptionalNumber(item.destinationLongitude),
      altitudeFt: this.toNumber(item.altitudeFt),
      speedKmh: this.toNumber(item.speedKmh),
      headingDegree: this.toNumber(item.headingDegree),
      progressPercent: Math.max(0, Math.min(100, this.toNumber(item.progressPercent))),
      remainingDistanceKm: this.toNumber(item.remainingDistanceKm ?? item.distanceRemainingKm),
      distanceRemainingKm: this.toNumber(item.distanceRemainingKm ?? item.remainingDistanceKm),
      estimatedLandingMinutes: this.toNumber(item.estimatedLandingMinutes),
      trackingMode: item.trackingMode || 'MANUAL',
      trackingSource: item.trackingSource || item.trackingMode || 'N/A'
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
}
