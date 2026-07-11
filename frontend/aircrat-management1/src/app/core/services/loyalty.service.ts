// ═══════════════════════════════════════════════════════════════════
// FILE: src/app/core/services/loyalty.service.ts
// API base: http://localhost:8080/api/loyalty
// ═══════════════════════════════════════════════════════════════════
import { Injectable }  from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';

import {
  LoyaltyAccount,
  LoyaltyTransaction,
  LoyaltyStats,
  RedemptionPreview,
  EnrollRequest,
  AwardRequest,
  RedeemRequest,
  BonusRequest
} from '../models/loyalty.model';

@Injectable({ providedIn: 'root' })
export class LoyaltyService {

  private readonly api = 'http://localhost:8080/api/loyalty';

  constructor(private http: HttpClient) {}

  // ── Account Reads ─────────────────────────────────────────────
  /** GET /api/loyalty — all active accounts, sorted by points desc */
  getAll(): Observable<LoyaltyAccount[]> {
    return this.http.get<LoyaltyAccount[]>(this.api);
  }

  /** GET /api/loyalty/{id} */
  getById(id: number): Observable<LoyaltyAccount> {
    return this.http.get<LoyaltyAccount>(`${this.api}/${id}`);
  }

  /** GET /api/loyalty/passenger/{passengerId} */
  getByPassengerId(pid: number): Observable<LoyaltyAccount> {
    return this.http.get<LoyaltyAccount>(`${this.api}/passenger/${pid}`);
  }

  /** GET /api/loyalty/member/{memberNumber} */
  getByMemberNumber(mn: string): Observable<LoyaltyAccount> {
    return this.http.get<LoyaltyAccount>(`${this.api}/member/${mn}`);
  }

  /** GET /api/loyalty/tier/{tier} */
  getByTier(tier: string): Observable<LoyaltyAccount[]> {
    return this.http.get<LoyaltyAccount[]>(`${this.api}/tier/${tier}`);
  }

  /** GET /api/loyalty/top-earners?limit=10 */
  getTopEarners(limit = 10): Observable<LoyaltyAccount[]> {
    return this.http.get<LoyaltyAccount[]>(`${this.api}/top-earners?limit=${limit}`);
  }

  /** GET /api/loyalty/stats */
  getStats(): Observable<LoyaltyStats> {
    return this.http.get<LoyaltyStats>(`${this.api}/stats`);
  }

  /** GET /api/loyalty/search?q=keyword — full search */
  search(q: string): Observable<LoyaltyAccount[]> {
    return this.http.get<LoyaltyAccount[]>(`${this.api}/search?q=${encodeURIComponent(q)}`);
  }

  /** GET /api/loyalty/autocomplete?prefix=Jo — autocomplete dropdown */
  autocomplete(prefix: string): Observable<LoyaltyAccount[]> {
    return this.http.get<LoyaltyAccount[]>(`${this.api}/autocomplete?prefix=${encodeURIComponent(prefix)}`);
  }

  // ── Transactions ──────────────────────────────────────────────
  /** GET /api/loyalty/{id}/transactions */
  getTransactions(accountId: number): Observable<LoyaltyTransaction[]> {
    return this.http.get<LoyaltyTransaction[]>(`${this.api}/${accountId}/transactions`);
  }

  /** GET /api/loyalty/passenger/{pid}/transactions */
  getTransactionsByPassenger(pid: number): Observable<LoyaltyTransaction[]> {
    return this.http.get<LoyaltyTransaction[]>(`${this.api}/passenger/${pid}/transactions`);
  }

  // ── Redemption Preview ────────────────────────────────────────
  /** GET /api/loyalty/{id}/redeem-preview?points=500 */
  getRedemptionPreview(accountId: number, points: number): Observable<RedemptionPreview> {
    return this.http.get<RedemptionPreview>(`${this.api}/${accountId}/redeem-preview?points=${points}`);
  }

  // ── Write Operations ──────────────────────────────────────────
  /** POST /api/loyalty/enroll */
  enroll(data: EnrollRequest): Observable<LoyaltyAccount> {
    return this.http.post<LoyaltyAccount>(`${this.api}/enroll`, data);
  }

  /** POST /api/loyalty/{id}/award */
  awardPoints(accountId: number, data: AwardRequest): Observable<LoyaltyTransaction> {
    return this.http.post<LoyaltyTransaction>(`${this.api}/${accountId}/award`, data);
  }

  /** POST /api/loyalty/{id}/redeem */
  redeemPoints(accountId: number, data: RedeemRequest): Observable<LoyaltyTransaction> {
    return this.http.post<LoyaltyTransaction>(`${this.api}/${accountId}/redeem`, data);
  }

  /** POST /api/loyalty/{id}/bonus */
  awardBonus(accountId: number, data: BonusRequest): Observable<LoyaltyTransaction> {
    return this.http.post<LoyaltyTransaction>(`${this.api}/${accountId}/bonus`, data);
  }

  /** PATCH /api/loyalty/{id}/toggle-active */
  toggleActive(id: number): Observable<LoyaltyAccount> {
    return this.http.patch<LoyaltyAccount>(`${this.api}/${id}/toggle-active`, {});
  }
}