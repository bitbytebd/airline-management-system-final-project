import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { LoyaltyService } from 'src/app/core/services/loyalty.service';
import { LoyaltyStats, LoyaltyTier, TIER_META } from 'src/app/core/models/loyalty.model';

interface TierView {
  tier: LoyaltyTier;
  members: number;
  annualValue: string;
  upgradeCredit: string;
  loungeAccess: string;
  baggage: string;
  support: string;
}

@Component({
  selector: 'app-loyalty-tiers',
  templateUrl: './loyalty-tiers.component.html',
  styleUrls: ['./loyalty-tiers.component.css']
})
export class LoyaltyTiersComponent implements OnInit {
  readonly tierMeta = TIER_META;
  readonly tierOrder: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];

  loading = true;
  stats: LoyaltyStats = {
    totalMembers: 0,
    bronzeCount: 0,
    silverCount: 0,
    goldCount: 0,
    platinumCount: 0,
    totalPointsEverIssued: 0,
    totalPointsRedeemed: 0,
    totalAvailablePoints: 0,
    totalRedeemedValueBDT: 0,
    totalRedeemedValueUSD: 0
  };

  tierViews: TierView[] = [
    {
      tier: 'BRONZE',
      members: 0,
      annualValue: '$25',
      upgradeCredit: 'Standard',
      loungeAccess: 'Paid access',
      baggage: '1 checked bag',
      support: 'Standard desk'
    },
    {
      tier: 'SILVER',
      members: 0,
      annualValue: '$75',
      upgradeCredit: 'Low priority',
      loungeAccess: '1 annual visit',
      baggage: '1 extra bag',
      support: 'Priority email'
    },
    {
      tier: 'GOLD',
      members: 0,
      annualValue: '$180',
      upgradeCredit: 'High priority',
      loungeAccess: '4 annual visits',
      baggage: '2 extra bags',
      support: 'Dedicated desk'
    },
    {
      tier: 'PLATINUM',
      members: 0,
      annualValue: '$420',
      upgradeCredit: 'Top priority',
      loungeAccess: 'Unlimited',
      baggage: '3 extra bags',
      support: 'Concierge line'
    }
  ];

  constructor(private svc: LoyaltyService, private router: Router) {}

  ngOnInit(): void {
    this.svc.getStats().subscribe({
      next: stats => {
        this.stats = stats;
        this.syncMembers();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  openTier(tier: LoyaltyTier): void {
    this.router.navigate(['/loyalty'], { queryParams: { tier } });
  }

  goRedeem(): void {
    this.router.navigate(['/loyalty/redeem']);
  }

  getMemberShare(tier: LoyaltyTier): number {
    const count = this.getCount(tier);
    if (!this.stats.totalMembers) return 0;
    return Math.round((count / this.stats.totalMembers) * 100);
  }

  getRange(tier: LoyaltyTier): string {
    const meta = this.tierMeta[tier];
    if (!meta.maxPoints) return `${this.formatNum(meta.minPoints)}+ pts`;
    return `${this.formatNum(meta.minPoints)} - ${this.formatNum(meta.maxPoints)} pts`;
  }

  formatNum(n: number | undefined): string {
    return (n ?? 0).toLocaleString('en-US');
  }

  private syncMembers(): void {
    this.tierViews = this.tierViews.map(view => ({
      ...view,
      members: this.getCount(view.tier)
    }));
  }

  private getCount(tier: LoyaltyTier): number {
    const map: Record<LoyaltyTier, number> = {
      BRONZE: this.stats.bronzeCount,
      SILVER: this.stats.silverCount,
      GOLD: this.stats.goldCount,
      PLATINUM: this.stats.platinumCount
    };
    return map[tier] || 0;
  }
}
