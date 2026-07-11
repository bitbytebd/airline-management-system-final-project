import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RefundService } from 'src/app/core/services/refund.service';
import { Refund, RefundStats, RefundStatus, REFUND_STATUS_META } from 'src/app/core/models/refund.model';

@Component({
  selector: 'app-refund-list',
  templateUrl: './refund-list.component.html',
  styleUrls: ['./refund-list.component.css']
})
export class RefundListComponent implements OnInit {

  refunds: Refund[] = [];
  stats: RefundStats = new RefundStats();
  
  activeTab: string = 'ALL';
  isLoading: boolean = false;
  searchQuery: string = '';
  suggestions: Refund[] = [];
  showSuggestions = false;
  actionLoadingId: number | null = null;
  notice = '';

  statusMeta = REFUND_STATUS_META;

  constructor(
    private service: RefundService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRefunds();
  }

  loadStats() {
    this.service.getStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Stats error', err)
    });
  }

  loadRefunds() {
    this.isLoading = true;
    
    if (this.activeTab === 'ALL') {
      this.service.getAll().subscribe({
        next: (data) => { this.refunds = data || []; this.refreshSuggestions(); this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    } else {
      this.service.getByStatus(this.activeTab).subscribe({
        next: (data) => { this.refunds = data || []; this.refreshSuggestions(); this.isLoading = false; },
        error: () => { this.isLoading = false; }
      });
    }
  }

  setFilter(status: string) {
    this.activeTab = status;
    this.loadRefunds();
  }

  onSearch() {
    if (!this.searchQuery.trim()) { this.loadRefunds(); return; }
    this.isLoading = true;
    this.service.search(this.searchQuery).subscribe({
      next: (data) => { this.refunds = data || []; this.refreshSuggestions(); this.isLoading = false; },
      error: () => { this.isLoading = false; }
    });
  }

  onSearchInput() {
    this.refreshSuggestions();
    this.showSuggestions = this.searchQuery.trim().length > 0 && this.suggestions.length > 0;
  }

  refreshSuggestions() {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.suggestions = [];
      return;
    }
    this.suggestions = this.refunds.filter(r =>
      (r.refundReference || '').toLowerCase().includes(q) ||
      (r.bookingReference || '').toLowerCase().includes(q) ||
      (r.passengerName || '').toLowerCase().includes(q) ||
      (r.passengerEmail || '').toLowerCase().includes(q) ||
      (r.flightNumber || '').toLowerCase().includes(q)
    ).slice(0, 6);
  }

  selectSuggestion(refund: Refund) {
    this.searchQuery = refund.refundReference || refund.bookingReference || '';
    this.showSuggestions = false;
    this.onSearch();
  }

  clearSearch() { this.searchQuery = ''; this.suggestions = []; this.showSuggestions = false; this.loadRefunds(); }

  // ✅ FIX: Accept undefined or number
  approve(id: number | undefined) {
    if(!id) return;
    if(confirm('Approve this refund request?')) {
      this.actionLoadingId = id;
      this.service.approve(id).subscribe({
        next: () => { this.notice = 'Refund approved successfully.'; this.actionLoadingId = null; this.loadRefunds(); this.loadStats(); },
        error: (err) => { this.actionLoadingId = null; alert(err.error?.error || 'Error'); }
      });
    }
  }

  process(id: number | undefined) {
    if(!id) return;
    if(confirm('Mark as processed?')) {
      this.actionLoadingId = id;
      this.service.process(id).subscribe({
        next: () => { this.notice = 'Refund payment marked as processed.'; this.actionLoadingId = null; this.loadRefunds(); this.loadStats(); },
        error: (err) => { this.actionLoadingId = null; alert(err.error?.error || 'Error'); }
      });
    }
  }

  reject(id: number | undefined) {
    if(!id) return;
    if(confirm('Reject this refund?')) {
      this.actionLoadingId = id;
      this.service.reject(id).subscribe({
        next: () => { this.notice = 'Refund rejected.'; this.actionLoadingId = null; this.loadRefunds(); this.loadStats(); },
        error: (err) => { this.actionLoadingId = null; alert(err.error?.error || 'Error'); }
      });
    }
  }

  goToInitiate() { this.router.navigate(['/refund/initiate']); }

  // ✅ FIX: Safe type casting
  getStatusClass(status: RefundStatus): string {
    return this.statusMeta[status]?.label?.toLowerCase() || 'unknown';
  }
  
  formatDate(date: string): string {
    if(!date) return '--';
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  formatAmount(n: number | undefined): string {
    return n != null ? 'USD ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '--';
  }

  isActionLoading(id: number | undefined): boolean {
    return !!id && this.actionLoadingId === id;
  }
}
