// FILE: src/app/features/loyalty/loyalty-list/loyalty-list.component.ts
import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { LoyaltyService }  from 'src/app/core/services/loyalty.service';
import { PassengerService } from 'src/app/core/services/passenger.service';
import {
  EnrollRequest, LoyaltyAccount, LoyaltyStats, LoyaltyTier,
  LoyaltyTransaction, TIER_META, TX_META
} from 'src/app/core/models/loyalty.model';
import { Passenger } from 'src/app/core/models/passenger.model';

@Component({
  selector:    'app-loyalty-list',
  templateUrl: './loyalty-list.component.html',
  styleUrls:   ['./loyalty-list.component.css']
})
export class LoyaltyListComponent implements OnInit, OnDestroy {

  accounts:   LoyaltyAccount[] = [];
  filtered:   LoyaltyAccount[] = [];
  stats: LoyaltyStats = {
    totalMembers:0, bronzeCount:0, silverCount:0, goldCount:0,
    platinumCount:0, totalPointsEverIssued:0, totalPointsRedeemed:0,
    totalAvailablePoints:0, totalRedeemedValueBDT:0, totalRedeemedValueUSD:0
  };

  loading       = true;
  tierFilter    = '';
  sortField     = 'availablePoints';
  sortAsc       = false;
  expandedId:   number | null = null;
  txLoading     = false;
  transactions: LoyaltyTransaction[] = [];
  alertMsg  = '';
  alertType = '';
  passengers: Passenger[] = [];
  showEnrollModal = false;
  passengerSearchText = '';
  selectedPassenger: Passenger | null = null;
  enrollLoading = false;

  searchText      = '';
  suggestions:    LoyaltyAccount[] = [];
  showSuggestions = false;
  searchLoading   = false;
  isSearchFocused = false;
  highlightIdx    = -1;

  private searchSub!: Subscription;
  private searchSubject = new Subject<string>();

  readonly tierMeta = TIER_META;
  readonly txMeta   = TX_META;
  readonly allTiers: LoyaltyTier[] = ['BRONZE','SILVER','GOLD','PLATINUM'];

  constructor(
    private svc:    LoyaltyService,
    private passengerSvc: PassengerService,
    private router: Router,
    private route:  ActivatedRoute,
    private elRef:  ElementRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tier'] && this.allTiers.includes(params['tier'])) {
        this.tierFilter = params['tier'];
        this.applyFilter();
      }
    });
    this.loadAll();
    this.loadPassengers();
    this.searchSub = this.searchSubject.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(q => {
        const term = q.trim();
        if (!term) {
          this.searchLoading = false;
          return of([] as LoyaltyAccount[]);
        }
        this.searchLoading = true;
        return this.svc.autocomplete(term).pipe(
          map(results => this.mergeSuggestions(this.getLocalSuggestions(term), results)),
          catchError(() => of(this.getLocalSuggestions(term)))
        );
      })
    ).subscribe({
      next: (results: LoyaltyAccount[]) => {
        this.suggestions      = results.slice(0, 8);
        this.showSuggestions  = this.suggestions.length > 0 && this.isSearchFocused;
        this.searchLoading    = false;
        this.highlightIdx     = -1;
      },
      error: () => { this.searchLoading = false; }
    });
  }

  loadAll(): void {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: d  => {
        this.accounts = d || [];
        this.applyFilter();
        this.refreshLocalSuggestions();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
    this.svc.getStats().subscribe({ next: s => this.stats = s, error: () => {} });
  }

  loadPassengers(): void {
    this.passengerSvc.getPassengers().subscribe({
      next: data => this.passengers = data || [],
      error: () => this.passengers = []
    });
  }

  get passengerSuggestions(): Passenger[] {
    const q = this.passengerSearchText.trim().toLowerCase();
    if (!q) return [];
    const enrolledPassengerIds = new Set(this.accounts.map(acc => acc.passengerId));
    return this.passengers
      .filter(p => !p.id || !enrolledPassengerIds.has(p.id))
      .filter(p =>
        [p.firstName, p.lastName, p.email, p.phoneNumber, p.passportNumber]
          .some(value => (value || '').toString().toLowerCase().includes(q))
      )
      .slice(0, 8);
  }

  openEnrollModal(): void {
    this.showEnrollModal = true;
    this.passengerSearchText = '';
    this.selectedPassenger = null;
    if (this.passengers.length === 0) this.loadPassengers();
  }

  closeEnrollModal(): void {
    this.showEnrollModal = false;
    this.passengerSearchText = '';
    this.selectedPassenger = null;
  }

  selectPassenger(passenger: Passenger): void {
    this.selectedPassenger = passenger;
    this.passengerSearchText = this.getPassengerName(passenger);
  }

  enrollSelectedPassenger(): void {
    if (!this.selectedPassenger?.id) {
      this.showAlert('Select a passenger before enrolling.', 'error');
      return;
    }
    const p = this.selectedPassenger;
    const payload: EnrollRequest = {
      passengerId: p.id!,
      passengerName: this.getPassengerName(p),
      passengerEmail: p.email || '',
      passportNumber: p.passportNumber || '',
      phoneNumber: p.phoneNumber || ''
    };
    this.enrollLoading = true;
    this.svc.enroll(payload).subscribe({
      next: account => {
        this.accounts = [account, ...this.accounts];
        this.applyFilter();
        this.svc.getStats().subscribe({ next: s => this.stats = s, error: () => {} });
        this.enrollLoading = false;
        this.closeEnrollModal();
        this.showAlert(`${account.passengerName} enrolled as ${account.memberNumber}.`, 'success');
      },
      error: e => {
        this.enrollLoading = false;
        this.showAlert(e?.error?.error || e?.error || 'Could not enroll passenger.', 'error');
      }
    });
  }

  getPassengerName(passenger: Passenger): string {
    return `${passenger.firstName || ''} ${passenger.lastName || ''}`.trim() || 'Passenger';
  }

  onSearchInput(): void {
    this.applyFilter();
    this.refreshLocalSuggestions();
    this.searchSubject.next(this.searchText);
    if (!this.searchText.trim()) {
      this.suggestions = [];
      this.showSuggestions = false;
      this.searchLoading = false;
    }
  }

  onSearchFocus(): void {
    this.isSearchFocused = true;
    if (this.searchText.trim().length >= 1) {
      this.refreshLocalSuggestions();
      if (this.suggestions.length > 0) this.showSuggestions = true;
      else this.searchSubject.next(this.searchText);
    }
  }

  onSearchBlur(): void {
    setTimeout(() => { this.isSearchFocused = false; this.showSuggestions = false; }, 200);
  }

  onKeyDown(e: KeyboardEvent): void {
    if (!this.showSuggestions) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.highlightIdx = Math.min(this.highlightIdx + 1, this.suggestions.length - 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.highlightIdx = Math.max(this.highlightIdx - 1, -1); }
    else if (e.key === 'Enter' && this.highlightIdx >= 0) { e.preventDefault(); this.selectSuggestion(this.suggestions[this.highlightIdx]); }
    else if (e.key === 'Escape') { this.showSuggestions = false; }
  }

  selectSuggestion(acc: LoyaltyAccount): void {
    this.searchText = acc.passengerName || acc.memberNumber || '';
    this.filtered = [acc];
    this.showSuggestions = false; this.suggestions = []; this.highlightIdx = -1;
  }

  clearSearch(): void {
    this.searchText = ''; this.suggestions = [];
    this.showSuggestions = false; this.applyFilter();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (!this.elRef.nativeElement.contains(e.target)) this.showSuggestions = false;
  }

  applyFilter(): void {
    const q = this.searchText.toLowerCase().trim();
    this.filtered = this.accounts.filter(a =>
      (!q || a.passengerName?.toLowerCase().includes(q) || a.passengerEmail?.toLowerCase().includes(q)
           || a.memberNumber?.toLowerCase().includes(q) || a.passportNumber?.toLowerCase().includes(q)) &&
      (!this.tierFilter || a.tier === this.tierFilter)
    );
    this.sortList();
  }

  private refreshLocalSuggestions(): void {
    const q = this.searchText.trim();
    this.suggestions = this.getLocalSuggestions(q);
    this.showSuggestions = this.suggestions.length > 0 && this.isSearchFocused && q.length > 0;
    this.highlightIdx = -1;
  }

  private getLocalSuggestions(q: string): LoyaltyAccount[] {
    const term = q.toLowerCase().trim();
    if (!term) return [];
    const startsWith = (v?: string) => (v || '').toLowerCase().startsWith(term);
    const includes = (v?: string) => (v || '').toLowerCase().includes(term);
    const ranked = [...this.accounts].sort((a, b) => {
      const aStrong = startsWith(a.passengerName) || startsWith(a.passengerEmail) || startsWith(a.memberNumber) || startsWith(a.passportNumber);
      const bStrong = startsWith(b.passengerName) || startsWith(b.passengerEmail) || startsWith(b.memberNumber) || startsWith(b.passportNumber);
      if (aStrong !== bStrong) return aStrong ? -1 : 1;
      return (b.availablePoints || 0) - (a.availablePoints || 0);
    });
    return ranked.filter(a =>
      includes(a.passengerName) ||
      includes(a.passengerEmail) ||
      includes(a.memberNumber) ||
      includes(a.passportNumber)
    ).slice(0, 10);
  }

  private mergeSuggestions(local: LoyaltyAccount[], remote: LoyaltyAccount[]): LoyaltyAccount[] {
    const seen = new Set<number>();
    return [...local, ...(remote || [])].filter(acc => {
      if (!acc || seen.has(acc.id)) return false;
      seen.add(acc.id);
      return true;
    }).slice(0, 10);
  }

  sortBy(field: string): void {
    this.sortAsc = this.sortField === field ? !this.sortAsc : false;
    this.sortField = field; this.sortList();
  }

  sortList(): void {
    this.filtered.sort((a: any, b: any) => {
      const av = a[this.sortField] ?? 0, bv = b[this.sortField] ?? 0;
      return this.sortAsc ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });
  }

  getSortIcon(f: string): string {
    return this.sortField !== f ? 'fa-sort' : this.sortAsc ? 'fa-sort-up' : 'fa-sort-down';
  }

  toggleExpand(acc: LoyaltyAccount): void {
    if (this.expandedId === acc.id) { this.expandedId = null; return; }
    this.expandedId = acc.id; this.txLoading = true; this.transactions = [];
    this.svc.getTransactions(acc.id).subscribe({
      next: txs => { this.transactions = txs.slice(0, 5); this.txLoading = false; },
      error: ()  => { this.txLoading = false; }
    });
  }

  isExpanded(acc: LoyaltyAccount): boolean { return this.expandedId === acc.id; }

  toggleActive(acc: LoyaltyAccount): void {
    this.svc.toggleActive(acc.id).subscribe({
      next: u => {
        const i = this.accounts.findIndex(a => a.id === u.id);
        if (i > -1) this.accounts[i] = u; this.applyFilter();
        this.showAlert(`Account ${u.isActive ? 'activated' : 'deactivated'}.`, 'success');
      },
      error: e => this.showAlert(e?.error?.error || 'Failed.', 'error')
    });
  }

  navigateRedeem(acc: LoyaltyAccount): void {
    this.router.navigate(['/loyalty/redeem'], { queryParams: { accountId: acc.id } });
  }

  countTier(t: string): number { return this.accounts.filter(a => a.tier === t).length; }
  getTierMeta(tier: LoyaltyTier) { return this.tierMeta[tier] ?? this.tierMeta.BRONZE; }
  getTxMeta(type: string): any   { return (this.txMeta as any)[type] ?? { color:'#6b7f96', icon:'fa-circle', label:type }; }

  getProgressPct(acc: LoyaltyAccount): number {
    const m = this.tierMeta[acc.tier];
    if (!m.maxPoints) return 100;
    return Math.min(Math.max(((acc.tierQualifyingPoints - m.minPoints) / (m.maxPoints - m.minPoints)) * 100, 2), 100);
  }

  pointsToNext(acc: LoyaltyAccount): number {
    const m = this.tierMeta[acc.tier];
    if (!m.maxPoints) return 0;
    return Math.max(m.maxPoints + 1 - acc.tierQualifyingPoints, 0);
  }

  getNextTierLabel(acc: LoyaltyAccount): string {
    const map: Record<LoyaltyTier, string> = { BRONZE:'Silver', SILVER:'Gold', GOLD:'Platinum', PLATINUM:'Max' };
    return map[acc.tier];
  }

  formatNum(n: number | undefined): string { return (n ?? 0).toLocaleString('en-US'); }
  formatDT(d: string | null): string {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  }

  private showAlert(msg: string, type: string): void {
    this.alertMsg = msg; this.alertType = type;
    setTimeout(() => { this.alertMsg = ''; }, 4000);
  }

  ngOnDestroy(): void { this.searchSub?.unsubscribe(); }
}
