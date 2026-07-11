// FILE: src/app/features/refund/refund-pending/refund-pending.component.ts
import { Component, OnInit } from '@angular/core';
import { RefundService }     from 'src/app/core/services/refund.service';
import {
  Refund,
  RefundStats,
  REFUND_STATUS_META
} from 'src/app/core/models/refund.model';

@Component({
  selector:    'app-refund-pending',
  templateUrl: './refund-pending.component.html',
  styleUrls:   ['./refund-pending.component.css']
})
export class RefundPendingComponent implements OnInit {

  pendingList:  Refund[] = [];
  approvedList: Refund[] = [];
  stats: RefundStats = {
    pendingCount:0, approvedCount:0,
    processedCount:0, rejectedCount:0,
    totalRefunded:0, totalPenalty:0
  };

  activeTab: 'pending' | 'approved' = 'pending';
  loadingPending  = true;
  loadingApproved = true;
  actionLoadingId: number | null = null;
  searchQuery = '';

  alertMsg  = '';
  alertType = '';

  sortField = 'requestedAt';
  sortAsc   = false;

  readonly statusMeta = REFUND_STATUS_META;

  constructor(private svc: RefundService) {}

  ngOnInit(): void { this.loadAll(); }

  loadAll(): void {
    this.loadingPending  = true;
    this.loadingApproved = true;

    this.svc.getPending().subscribe({
      next: d  => { this.pendingList  = d; this.loadingPending  = false; },
      error: () => { this.loadingPending  = false; }
    });
    this.svc.getByStatus('APPROVED').subscribe({
      next: d  => { this.approvedList = d; this.loadingApproved = false; },
      error: () => { this.loadingApproved = false; }
    });
    this.svc.getStats().subscribe({
      next: s => this.stats = s, error: () => {}
    });
  }

  approve(r: Refund): void {
    if (!confirm(
      `Approve refund ${r.refundReference}?\n` +
      `Refund amount: $USD ${r.refundAmount?.toFixed(2)} → ${r.paymentMethod}`
    )) return;
    this.actionLoadingId = r.id!;
    this.svc.approve(r.id!).subscribe({
      next:  () => { this.showAlert(`Refund ${r.refundReference} approved!`, 'success'); this.loadAll(); this.actionLoadingId = null; },
      error: e  => { this.showAlert(e?.error?.error || 'Approval failed.', 'error'); this.actionLoadingId = null; }
    });
  }

  process(r: Refund): void {
    if (!confirm(
      `Mark ${r.refundReference} as PROCESSED?\n` +
      `Confirms $USD ${r.refundAmount?.toFixed(2)} sent to passenger.`
    )) return;
    this.actionLoadingId = r.id!;
    this.svc.process(r.id!).subscribe({
      next:  () => { this.showAlert(`Refund ${r.refundReference} processed!`, 'success'); this.loadAll(); this.actionLoadingId = null; },
      error: e  => { this.showAlert(e?.error?.error || 'Failed.', 'error'); this.actionLoadingId = null; }
    });
  }

  reject(r: Refund): void {
    if (!confirm(`Reject refund ${r.refundReference}? Cannot be undone.`)) return;
    this.actionLoadingId = r.id!;
    this.svc.reject(r.id!).subscribe({
      next:  () => { this.showAlert(`Refund ${r.refundReference} rejected.`, 'warn'); this.loadAll(); this.actionLoadingId = null; },
      error: e  => { this.showAlert(e?.error?.error || 'Failed.', 'error'); this.actionLoadingId = null; }
    });
  }

  sortBy(field: string): void {
    this.sortAsc   = this.sortField === field ? !this.sortAsc : true;
    this.sortField = field;
    const list = this.activeTab === 'pending' ? this.pendingList : this.approvedList;
    list.sort((a: any, b: any) => {
      const av = a[field] ?? '', bv = b[field] ?? '';
      return this.sortAsc ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
    });
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return 'fa-sort';
    return this.sortAsc ? 'fa-sort-up' : 'fa-sort-down';
  }

  get currentList():    Refund[] { return this.activeTab === 'pending' ? this.pendingList  : this.approvedList; }
  get currentLoading(): boolean  { return this.activeTab === 'pending' ? this.loadingPending : this.loadingApproved; }
  get visibleList(): Refund[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.currentList;
    return this.currentList.filter(r =>
      (r.refundReference || '').toLowerCase().includes(q) ||
      (r.bookingReference || '').toLowerCase().includes(q) ||
      (r.passengerName || '').toLowerCase().includes(q) ||
      (r.flightNumber || '').toLowerCase().includes(q) ||
      String(r.refundReason || '').toLowerCase().includes(q)
    );
  }

  isActionLoading(id: number): boolean { return this.actionLoadingId === id; }

  getTotalPendingAmount(): string {
    const total = this.visibleList.reduce((sum, r) => sum + (r.refundAmount ?? 0), 0);
    return '$USD ' + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getPenaltyClass(pct: number): string {
    if (pct === 0)  return 'pen-none';
    if (pct <= 10)  return 'pen-low';
    if (pct <= 25)  return 'pen-mid';
    return 'pen-high';
  }

  getUrgencyClass(r: Refund): string {
    if (!r.departureDate) return '';
    const diff = (new Date(r.departureDate).getTime() - Date.now()) / 86400000;
    if (diff < 0)  return 'urgent-past';
    if (diff < 1)  return 'urgent-critical';
    if (diff < 3)  return 'urgent-high';
    return '';
  }

  getUrgencyLabel(r: Refund): string {
    if (!r.departureDate) return '';
    const diff = (new Date(r.departureDate).getTime() - Date.now()) / 86400000;
    if (diff < 0)  return 'Flight passed';
    if (diff < 1)  return 'Today!';
    if (diff < 3)  return `${Math.ceil(diff)}d left`;
    return '';
  }

  formatDate(d: string): string {
    if (!d) return '--';
    return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  }

  formatDT(d: string): string {
    if (!d) return '--';
    return new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' });
  }

  formatAmount(n: number | undefined): string {
    if (n == null) return '--';
    return '$USD ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ── PERMANENT FIX FOR REASON ERROR ───────────────────────────────
  formatReason(reason: any): string {
    // Convert to string safely, fallback to empty, then replace underscores
    return String(reason || '').replace(/_/g, ' ');
  }

  private showAlert(msg: string, type: string): void {
    this.alertMsg = msg; this.alertType = type;
    setTimeout(() => { this.alertMsg = ''; }, 5000);
  }
}
