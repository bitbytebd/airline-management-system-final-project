import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { LoyaltyService } from 'src/app/core/services/loyalty.service';
import {
  LoyaltyAccount,
  LoyaltyTransaction,
  RedemptionPreview,
  TIER_META
} from 'src/app/core/models/loyalty.model';

@Component({
  selector: 'app-loyalty-redeem',
  templateUrl: './loyalty-redeem.component.html',
  styleUrls: ['./loyalty-redeem.component.css']
})
export class LoyaltyRedeemComponent implements OnInit, OnDestroy {
  step = 1;

  searchText = '';
  suggestions: LoyaltyAccount[] = [];
  showSuggestions = false;
  searchLoading = false;
  searchFocused = false;
  highlightIdx = -1;
  selectedAccount: LoyaltyAccount | null = null;
  searchError = '';

  redeemForm!: FormGroup;
  preview: RedemptionPreview | null = null;
  previewLoading = false;
  previewError = '';
  readonly POINTS_STEP = 100;
  readonly MIN_POINTS = 100;
  Math = Math;

  submitting = false;
  submitError = '';
  successTx: LoyaltyTransaction | null = null;
  recentTx: LoyaltyTransaction[] = [];

  readonly tierMeta = TIER_META;

  private allAccounts: LoyaltyAccount[] = [];
  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private svc: LoyaltyService
  ) {}

  ngOnInit(): void {
    this.redeemForm = this.fb.group({
      pointsToRedeem: [100, [Validators.required, Validators.min(100)]],
      bookingReference: [''],
      confirmUnderstand: [false, Validators.requiredTrue]
    });

    this.svc.getAll().subscribe({
      next: accounts => {
        this.allAccounts = accounts || [];
        this.refreshLocalSuggestions();
      },
      error: () => {}
    });

    this.route.queryParams.subscribe(params => {
      if (params['accountId']) {
        this.svc.getById(Number(params['accountId'])).subscribe({
          next: acc => {
            this.selectedAccount = acc;
            this.searchText = acc.passengerName || acc.memberNumber;
            this.step = 2;
            this.loadRecent();
            this.loadPreview(this.redeemForm.get('pointsToRedeem')?.value || this.MIN_POINTS);
          },
          error: () => {}
        });
      }
    });

    this.searchSub = this.searchSubject.pipe(
      debounceTime(240),
      distinctUntilChanged(),
      switchMap(prefix => {
        const term = prefix.trim();
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
      next: results => {
        this.suggestions = results.slice(0, 10);
        this.showSuggestions = this.suggestions.length > 0 && this.searchFocused;
        this.searchLoading = false;
        this.highlightIdx = -1;
      },
      error: () => {
        this.searchLoading = false;
      }
    });

    this.redeemForm.get('pointsToRedeem')?.valueChanges.pipe(
      debounceTime(350),
      distinctUntilChanged()
    ).subscribe(pts => {
      if (this.selectedAccount && pts >= this.MIN_POINTS) this.loadPreview(pts);
    });
  }

  onSearchInput(): void {
    this.searchError = '';
    this.selectedAccount = null;
    this.preview = null;
    this.refreshLocalSuggestions();
    if (!this.searchText.trim()) {
      this.clearSuggestions();
      this.searchLoading = false;
      return;
    }
    this.searchSubject.next(this.searchText);
  }

  onSearchFocus(): void {
    this.searchFocused = true;
    this.refreshLocalSuggestions();
    if (this.searchText.trim()) this.searchSubject.next(this.searchText);
  }

  onSearchKeydown(e: KeyboardEvent): void {
    if (!this.showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.highlightIdx = Math.min(this.highlightIdx + 1, this.suggestions.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.highlightIdx = Math.max(this.highlightIdx - 1, -1);
    } else if (e.key === 'Enter' && this.highlightIdx >= 0) {
      e.preventDefault();
      this.selectSuggestion(this.suggestions[this.highlightIdx]);
    } else if (e.key === 'Escape') {
      this.clearSuggestions();
    }
  }

  selectSuggestion(acc: LoyaltyAccount): void {
    if (!acc.isActive) {
      this.searchError = 'This loyalty account is inactive.';
      return;
    }
    if (acc.availablePoints < this.MIN_POINTS) {
      this.searchError = `${acc.passengerName} has insufficient points (${this.formatNum(acc.availablePoints)}).`;
      return;
    }
    this.selectedAccount = acc;
    this.searchText = acc.passengerName || acc.memberNumber;
    this.clearSuggestions();
    this.loadRecent();
  }

  proceedToStep2(): void {
    if (!this.selectedAccount) {
      this.searchError = 'Please select a member first.';
      return;
    }
    this.step = 2;
    this.loadPreview(this.redeemForm.get('pointsToRedeem')?.value || this.MIN_POINTS);
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (!(e.target as HTMLElement).closest('.lr-search-wrap')) {
      this.searchFocused = false;
      this.clearSuggestions();
    }
  }

  clearSuggestions(): void {
    this.suggestions = [];
    this.showSuggestions = false;
    this.highlightIdx = -1;
  }

  clearMember(): void {
    this.selectedAccount = null;
    this.searchText = '';
    this.clearSuggestions();
    this.preview = null;
    this.searchError = '';
    this.step = 1;
  }

  loadPreview(points: number): void {
    if (!this.selectedAccount || points < this.MIN_POINTS) return;
    if (points % this.POINTS_STEP !== 0) {
      this.previewError = 'Points must be in multiples of 100.';
      this.preview = null;
      return;
    }
    if (points > this.selectedAccount.availablePoints) {
      this.previewError = 'Exceeds available points.';
      this.preview = null;
      return;
    }
    this.previewError = '';
    this.previewLoading = true;
    this.svc.getRedemptionPreview(this.selectedAccount.id, points).subscribe({
      next: p => {
        this.preview = p;
        this.previewLoading = false;
      },
      error: e => {
        this.previewError = e?.error?.error || 'Preview failed.';
        this.previewLoading = false;
      }
    });
  }

  adjustPoints(delta: number): void {
    const ctrl = this.redeemForm.get('pointsToRedeem')!;
    const next = (ctrl.value || 0) + delta;
    if (next >= this.MIN_POINTS && next <= (this.selectedAccount?.availablePoints ?? 0)) {
      ctrl.setValue(next);
    }
  }

  setMaxPoints(): void {
    if (!this.selectedAccount) return;
    const maxRoundedDown = Math.floor(this.selectedAccount.availablePoints / this.POINTS_STEP) * this.POINTS_STEP;
    this.redeemForm.get('pointsToRedeem')?.setValue(maxRoundedDown);
  }

  proceedToStep3(): void {
    if (this.redeemForm.get('pointsToRedeem')?.invalid || !this.preview) return;
    this.redeemForm.get('confirmUnderstand')?.setValue(false);
    this.step = 3;
  }

  goBack(step: number): void {
    this.step = step;
    this.submitError = '';
  }

  confirmRedeem(): void {
    if (!this.selectedAccount || !this.redeemForm.get('confirmUnderstand')?.value) return;
    this.submitting = true;
    this.submitError = '';
    const value = this.redeemForm.value;
    this.svc.redeemPoints(this.selectedAccount.id, {
      pointsToRedeem: value.pointsToRedeem,
      bookingReference: value.bookingReference || undefined
    }).subscribe({
      next: tx => {
        this.successTx = tx;
        this.submitting = false;
        this.step = 4;
      },
      error: e => {
        this.submitError = e?.error?.error || 'Redemption failed. Please try again.';
        this.submitting = false;
      }
    });
  }

  loadRecent(): void {
    if (!this.selectedAccount) return;
    this.svc.getTransactions(this.selectedAccount.id).subscribe({
      next: txs => this.recentTx = txs.filter(t => t.transactionType === 'REDEEMED').slice(0, 3),
      error: () => {}
    });
  }

  startOver(): void {
    this.step = 1;
    this.selectedAccount = null;
    this.searchText = '';
    this.preview = null;
    this.successTx = null;
    this.submitError = '';
    this.searchError = '';
    this.redeemForm.reset({ pointsToRedeem: 100, bookingReference: '', confirmUnderstand: false });
  }

  getTierMeta(tier: any) {
    return this.tierMeta[tier as keyof typeof this.tierMeta] ?? this.tierMeta.BRONZE;
  }

  getAvailableAfterPct(): number {
    if (!this.selectedAccount || !this.preview) return 100;
    const base = this.selectedAccount.availablePoints || this.selectedAccount.totalPointsEarned || 1;
    return Math.min(100, Math.max(0, Math.round((this.preview.remainingPoints / base) * 100)));
  }

  formatNum(n: number | undefined): string {
    return (n ?? 0).toLocaleString('en-US');
  }

  formatDT(d: string): string {
    if (!d) return '--';
    return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  private refreshLocalSuggestions(): void {
    const q = this.searchText.trim();
    this.suggestions = this.getLocalSuggestions(q);
    this.showSuggestions = this.suggestions.length > 0 && this.searchFocused && q.length > 0;
    this.highlightIdx = -1;
  }

  private getLocalSuggestions(q: string): LoyaltyAccount[] {
    const term = q.toLowerCase().trim();
    if (!term) return [];
    const startsWith = (value?: string) => (value || '').toLowerCase().startsWith(term);
    const includes = (value?: string) => (value || '').toLowerCase().includes(term);
    return [...this.allAccounts].sort((a, b) => {
      const aStrong = startsWith(a.passengerName) || startsWith(a.passengerEmail) || startsWith(a.memberNumber) || startsWith(a.passportNumber);
      const bStrong = startsWith(b.passengerName) || startsWith(b.passengerEmail) || startsWith(b.memberNumber) || startsWith(b.passportNumber);
      if (aStrong !== bStrong) return aStrong ? -1 : 1;
      return (b.availablePoints || 0) - (a.availablePoints || 0);
    }).filter(acc =>
      includes(acc.passengerName) ||
      includes(acc.passengerEmail) ||
      includes(acc.memberNumber) ||
      includes(acc.passportNumber)
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

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }
}
