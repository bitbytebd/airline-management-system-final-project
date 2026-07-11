import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Flight } from 'src/app/core/models/flight.model';
import { FlightService } from 'src/app/core/services/flight.service';

interface DestinationCard {
  city: string;
  route: string;
  image: string;
  fare: string;
}

interface NavGroup {
  title: string;
  columns: {
    title: string;
    links: {
      label: string;
      route?: string;
      queryParams?: { [key: string]: string };
      href?: string;
      description?: string;
    }[];
  }[];
}

interface FooterGroup {
  title: string;
  links: { label: string; route?: string; queryParams?: { [key: string]: string }; href?: string }[];
}

interface FeatureCard {
  title: string;
  description: string;
  image?: string;
  action: string;
  route?: string;
  queryParams?: { [key: string]: string };
  href?: string;
}

interface AirportOption {
  city: string;
  code: string;
  country: string;
  value: string;
  searchText: string;
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  navOpen = false;
  activeMenu: string | null = null;
  heroImage = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=85';
  searchFrom = '';
  searchTo = '';
  searchDate = '';
  searchError = '';
  searchLoading = false;
  minTravelDate = new Date().toISOString().slice(0, 10);
  airportOptions: AirportOption[] = [];
  filteredFromOptions: AirportOption[] = [];
  filteredToOptions: AirportOption[] = [];
  activeAirportField: 'from' | 'to' | null = null;
  fromHighlightIndex = -1;
  toHighlightIndex = -1;

  constructor(
    private router: Router,
    private flightService: FlightService
  ) {}

  ngOnInit(): void {
    this.flightService.getAll().subscribe({
      next: flights => this.airportOptions = this.buildAirportOptions(flights || []),
      error: () => this.airportOptions = []
    });
  }

  navGroups: NavGroup[] = [
    {
      title: 'Book & Manage',
      columns: [
        {
          title: 'Book',
          links: [
            { label: 'Book a flight', route: '/flights/search', description: 'Search and request a booking' },
            { label: 'Search flights', route: '/flights/search', description: 'Find public flight options' },
            { label: 'Seat selection', href: '#experience', description: 'Understand cabin and seat options' }
          ]
        },
        {
          title: 'Manage',
          links: [
            { label: 'User Portal', route: '/user-portal', description: 'Passenger dashboard' },
            { label: 'Track booking', route: '/user-portal', queryParams: { mode: 'track' }, description: 'Find booking status' },
            { label: 'Payment records', route: '/user-portal', queryParams: { mode: 'manage' }, description: 'Review payment history' }
          ]
        },
        {
          title: 'Additional Services',
          links: [
            { label: 'Coupon offers', href: '#help-centre', description: 'Apply airline promotions' },
            { label: 'Waitlist support', href: '#help-centre', description: 'Recover demand when seats are full' },
            { label: 'Refund requests', href: '#help-centre', description: 'Manage refunds' }
          ]
        }
      ]
    },
    {
      title: 'Experience',
      columns: [
        {
          title: 'Cabin Classes',
          links: [
            { label: 'Business Class', href: '#experience', description: 'Premium cabin workflow' },
            { label: 'Economy Class', href: '#experience', description: 'Flexible travel experience' },
            { label: 'About Skyward', href: '#about-us', description: 'Airline story and service vision' }
          ]
        },
        {
          title: 'Flight Experience',
          links: [
            { label: 'Inflight services', href: '#experience', description: 'Connected passenger journey' },
            { label: 'Fleet and operations', href: '#fleet', description: 'Aircraft management overview' },
            { label: 'Our fleet', href: '#fleet', description: 'Aircraft comfort and capability' },
            { label: 'Flight status', route: '/flight-tracker', description: 'Operational tracking for passengers' }
          ]
        }
      ]
    },
    {
      title: 'Deals & Destinations',
      columns: [
        {
          title: 'Featured Routes',
          links: [
            { label: 'Zurich', href: '#destinations', description: 'Dhaka to Switzerland' },
            { label: 'Doha', href: '#destinations', description: 'Dhaka to Qatar' },
            { label: 'London', href: '#destinations', description: 'Dhaka to United Kingdom' }
          ]
        },
        {
          title: 'Offers',
          links: [
            { label: 'Coupon validation', href: '#experience', description: 'Check promotional eligibility' },
            { label: 'Loyalty rewards', href: '#experience', description: 'Earn and redeem points' }
          ]
        }
      ]
    },
    {
      title: 'Help',
      columns: [
        {
          title: 'Support',
          links: [
            { label: 'Passenger portal', route: '/user-portal', description: 'View your trip details' },
            { label: 'Help centre', href: '#help-centre', description: 'Forms, contact and assistance' },
            { label: 'Contact support', href: '#contact', description: 'Get airline assistance' }
          ]
        }
      ]
    },
    {
      title: 'Miles & Smiles',
      columns: [
        {
          title: 'Membership',
          links: [
            { label: 'Loyalty account', route: '/user-portal', description: 'Member list and status' },
            { label: 'Redeem points', href: '#experience', description: 'Use points for discounts' },
            { label: 'Tier privileges', href: '#experience', description: 'Bronze to Platinum tiers' }
          ]
        }
      ]
    },
    {
      title: 'Corporate Club',
      columns: [
        {
          title: 'Enterprise',
          links: [
            { label: 'Reports overview', href: '#about-us', description: 'Sales and expense insight' },
            { label: 'Revenue story', href: '#about-us', description: 'Profit and loss analysis' },
            { label: 'Admin login', route: '/auth/login', description: 'Staff access' }
          ]
        }
      ]
    }
  ];

  footerGroups: FooterGroup[] = [
    {
      title: 'Before and After Your Trip',
      links: [
        { label: 'Book a Flight', route: '/flights/search' },
        { label: 'Manage My Booking', route: '/user-portal', queryParams: { mode: 'manage' } },
        { label: 'Flight Status', route: '/flight-tracker' },
        { label: 'Frequently Asked Questions', href: '#contact' }
      ]
    },
    {
      title: 'Miles & Smiles',
      links: [
        { label: 'Become a Member', href: '#experience' },
        { label: 'My Account', route: '/user-portal', queryParams: { mode: 'manage' } },
        { label: 'Redeem Points', href: '#experience' },
        { label: 'Tier Benefits', href: '#experience' }
      ]
    },
    {
      title: 'Corporate',
      links: [
        { label: 'About Skyward', href: '#about-us' },
        { label: 'Fleet', href: '#fleet' },
        { label: 'Help Centre', href: '#help-centre' },
        { label: 'Admin Login', route: '/auth/login' }
      ]
    },
    {
      title: 'Useful Links',
      links: [
        { label: 'Coupon Offers', href: '#experience' },
        { label: 'Waitlist', href: '#experience' },
        { label: 'Refunds', href: '#help-centre' },
        { label: 'Passenger Rights', href: '#contact' }
      ]
    }
  ];

  destinations: DestinationCard[] = [
    { city: 'Zurich', route: 'Dhaka to Switzerland', image: 'https://images.unsplash.com/photo-1504457047772-27faf1c00561?auto=format&fit=crop&w=900&q=80', fare: 'From $820' },
    { city: 'Doha', route: 'Dhaka to Qatar', image: 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=900&q=80', fare: 'From $460' },
    { city: 'London', route: 'Dhaka to United Kingdom', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=80', fare: 'From $740' }
  ];

  aboutCards: FeatureCard[] = [
    {
      title: 'Our Success Story',
      description: 'A modern airline platform built around connected reservation, payment, loyalty and operational workflows.',
      image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=900&q=80',
      action: 'Explore operations',
      href: '#experience'
    },
    {
      title: 'Flight Destinations',
      description: 'International routes are presented with destination-first discovery, booking readiness and passenger self-service.',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
      action: 'View destinations',
      href: '#destinations'
    },
    {
      title: 'Partnerships & Service',
      description: 'Enterprise modules support airline partners, agents, payment operations, reports and customer care workflows.',
      image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=900&q=80',
      action: 'Open reports',
      href: '#contact'
    }
  ];

  fleetCards: FeatureCard[] = [
    {
      title: 'Boeing 787-9 Dreamliner',
      description: 'Long-haul comfort, quiet cabins and premium travel experience for global routes.',
      image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=900&q=80',
      action: 'Manage aircraft',
      href: '#fleet'
    },
    {
      title: 'Airbus A350-900',
      description: 'Efficient wide-body aircraft profile with modern cabin service and long-range capability.',
      image: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=900&q=80',
      action: 'View fleet',
      href: '#fleet'
    },
    {
      title: 'Boeing 777-300 ER',
      description: 'High-capacity international aircraft suitable for premium and high-demand operations.',
      image: 'https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=900&q=80',
      action: 'Track flights',
      route: '/flight-tracker'
    }
  ];

  helpCards: FeatureCard[] = [
    {
      title: 'Booking Changes',
      description: 'Manage booking updates, seat selection, meal preference, baggage and cancellation flow.',
      action: 'Manage booking',
      route: '/user-portal',
      queryParams: { mode: 'manage' }
    },
    {
      title: 'Changes & Refunds',
      description: 'Support passenger refund, disruption and payment follow-up from connected modules.',
      action: 'Request refund',
      href: '#contact'
    },
    {
      title: 'Baggage & Lost Items',
      description: 'Help passengers report damaged baggage, delayed baggage, lost items and special cases.',
      action: 'Open support',
      href: '#contact'
    },
    {
      title: 'Special Assistance',
      description: 'Guide passengers for wheelchair assistance, children, medical needs and pet travel requests.',
      action: 'Get help',
      href: '#contact'
    }
  ];

  toggleNav(): void {
    this.navOpen = !this.navOpen;
    if (!this.navOpen) this.activeMenu = null;
  }

  toggleMenu(title: string): void {
    this.activeMenu = this.activeMenu === title ? null : title;
  }

  closeMenus(): void {
    this.activeMenu = null;
    this.navOpen = false;
  }

  startBooking(): void {
    this.closeMenus();
    this.router.navigate(['/flights/search']);
  }

  searchFlights(from?: string, to?: string, date?: string): void {
    const queryParams: { [key: string]: string } = {};
    const cleanFrom = (from || this.searchFrom || '').trim();
    const cleanTo = (to || this.searchTo || '').trim();
    const cleanDate = (date || this.searchDate || '').trim();

    this.searchError = '';
    if (!cleanFrom || !cleanTo) {
      this.searchError = 'Please select both departure and arrival cities.';
      return;
    }
    if (this.sameAirport(cleanFrom, cleanTo)) {
      this.searchError = 'Origin and destination cannot be the same.';
      return;
    }
    if (!cleanDate) {
      this.searchError = 'Please select a departure date.';
      return;
    }
    if (cleanDate < this.minTravelDate) {
      this.searchError = 'Departure date cannot be in the past.';
      return;
    }

    if (cleanFrom) queryParams['from'] = cleanFrom;
    if (cleanTo) queryParams['to'] = cleanTo;
    if (cleanDate) queryParams['date'] = cleanDate;

    this.searchLoading = true;
    this.closeMenus();
    this.router.navigate(['/flights/search'], { queryParams });
  }

  onAirportInput(type: 'from' | 'to', value: string): void {
    this.searchError = '';
    this.activeAirportField = type;
    if (type === 'from') {
      this.searchFrom = value;
      this.fromHighlightIndex = -1;
      this.filteredFromOptions = this.filterAirportOptions(value);
    } else {
      this.searchTo = value;
      this.toHighlightIndex = -1;
      this.filteredToOptions = this.filterAirportOptions(value);
    }
  }

  selectAirport(type: 'from' | 'to', option: AirportOption): void {
    if (type === 'from') {
      this.searchFrom = option.value;
      this.filteredFromOptions = [];
      this.fromHighlightIndex = -1;
    } else {
      this.searchTo = option.value;
      this.filteredToOptions = [];
      this.toHighlightIndex = -1;
    }
    this.activeAirportField = null;
  }

  onAirportKeydown(event: KeyboardEvent, type: 'from' | 'to'): void {
    const options = type === 'from' ? this.filteredFromOptions : this.filteredToOptions;
    if (!options.length && event.key !== 'Escape') return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveAirportHighlight(type, 1, options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveAirportHighlight(type, -1, options.length);
    } else if (event.key === 'Enter') {
      const index = type === 'from' ? this.fromHighlightIndex : this.toHighlightIndex;
      if (index >= 0 && options[index]) {
        event.preventDefault();
        this.selectAirport(type, options[index]);
      }
    } else if (event.key === 'Escape') {
      this.closeAirportDropdowns();
    }
  }

  clearAirport(type: 'from' | 'to'): void {
    if (type === 'from') {
      this.searchFrom = '';
      this.filteredFromOptions = [];
      this.fromHighlightIndex = -1;
    } else {
      this.searchTo = '';
      this.filteredToOptions = [];
      this.toHighlightIndex = -1;
    }
  }

  swapRoute(): void {
    const previousFrom = this.searchFrom;
    this.searchFrom = this.searchTo;
    this.searchTo = previousFrom;
    this.closeAirportDropdowns();
  }

  goToSection(id: string): void {
    this.closeMenus();
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.replaceState(null, '', `#${id}`);
    } else {
      location.hash = id;
    }
  }

  goToHref(event: Event, href?: string): void {
    if (!href || !href.startsWith('#')) {
      this.closeMenus();
      return;
    }
    event.preventDefault();
    this.goToSection(href.substring(1));
  }

  private buildAirportOptions(flights: Flight[]): AirportOption[] {
    const map = new Map<string, AirportOption>();
    flights.forEach(flight => {
      [flight.origin, flight.destination].forEach(location => {
        const option = this.parseAirportOption(location);
        if (option) {
          const key = this.normalizeAirportValue(option.value);
          if (!map.has(key)) {
            map.set(key, option);
          }
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.city.localeCompare(b.city));
  }

  private parseAirportOption(value?: string): AirportOption | null {
    const raw = (value || '').trim();
    if (!raw) return null;
    const codeMatch = raw.match(/\b[A-Z]{3}\b/);
    const countryMatch = raw.match(/\(([^)]+)\)/);
    let code = codeMatch ? codeMatch[0] : '';
    let country = countryMatch ? countryMatch[1].trim() : '';
    let city = raw
      .replace(/\b[A-Z]{3}\b\s*[-–]?\s*/g, '')
      .replace(/\(([^)]+)\)/g, '')
      .replace(/\s*[-–]\s*/g, ' ')
      .trim();
    if (!city) city = raw;
    const known = this.knownAirport(city, code);
    code = code || known.code;
    country = country || known.country || 'International';
    const labelCode = code || city.substring(0, 3).toUpperCase();
    const optionValue = code ? `${code} - ${city}` : city;
    return {
      city,
      code: labelCode,
      country,
      value: optionValue,
      searchText: `${city} ${labelCode} ${country} ${raw}`.toLowerCase()
    };
  }

  private filterAirportOptions(value: string): AirportOption[] {
    const query = (value || '').trim().toLowerCase();
    if (!query) return [];
    return this.airportOptions
      .filter(option => option.searchText.includes(query))
      .slice(0, 8);
  }

  private moveAirportHighlight(type: 'from' | 'to', direction: number, length: number): void {
    if (!length) return;
    if (type === 'from') {
      this.fromHighlightIndex = (this.fromHighlightIndex + direction + length) % length;
    } else {
      this.toHighlightIndex = (this.toHighlightIndex + direction + length) % length;
    }
  }

  private closeAirportDropdowns(): void {
    this.activeAirportField = null;
    this.filteredFromOptions = [];
    this.filteredToOptions = [];
    this.fromHighlightIndex = -1;
    this.toHighlightIndex = -1;
  }

  private sameAirport(from: string, to: string): boolean {
    return this.normalizeAirportValue(from) === this.normalizeAirportValue(to);
  }

  private normalizeAirportValue(value: string): string {
    const code = value.match(/\b[A-Z]{3}\b/);
    return code ? code[0].toLowerCase() : value.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  private knownAirport(city: string, code: string): { code: string; country: string } {
    const key = (code || city).toLowerCase();
    const airports: { [key: string]: { code: string; country: string } } = {
      dhaka: { code: 'DAC', country: 'Bangladesh' },
      dac: { code: 'DAC', country: 'Bangladesh' },
      chattogram: { code: 'CGP', country: 'Bangladesh' },
      cgp: { code: 'CGP', country: 'Bangladesh' },
      dubai: { code: 'DXB', country: 'United Arab Emirates' },
      dxb: { code: 'DXB', country: 'United Arab Emirates' },
      doha: { code: 'DOH', country: 'Qatar' },
      doh: { code: 'DOH', country: 'Qatar' },
      delhi: { code: 'DEL', country: 'India' },
      del: { code: 'DEL', country: 'India' },
      london: { code: 'LHR', country: 'United Kingdom' },
      lhr: { code: 'LHR', country: 'United Kingdom' },
      zurich: { code: 'ZRH', country: 'Switzerland' },
      switzerland: { code: 'ZRH', country: 'Switzerland' },
      zrh: { code: 'ZRH', country: 'Switzerland' },
      singapore: { code: 'SIN', country: 'Singapore' },
      sin: { code: 'SIN', country: 'Singapore' },
      sydney: { code: 'SYD', country: 'Australia' },
      syd: { code: 'SYD', country: 'Australia' },
      tokyo: { code: 'HND', country: 'Japan' },
      hnd: { code: 'HND', country: 'Japan' },
      paris: { code: 'CDG', country: 'France' },
      cdg: { code: 'CDG', country: 'France' },
      frankfurt: { code: 'FRA', country: 'Germany' },
      fra: { code: 'FRA', country: 'Germany' },
      newyork: { code: 'JFK', country: 'United States' },
      'new york': { code: 'JFK', country: 'United States' },
      jfk: { code: 'JFK', country: 'United States' }
    };
    return airports[key] || { code: '', country: '' };
  }
}
