// ═══════════════════════════════════════════════════════════════════
// FILE: src/app/core/models/loyalty.model.ts
// Mirrors LoyaltyAccount, LoyaltyTransaction Java models exactly
// ═══════════════════════════════════════════════════════════════════

// ── Enums ─────────────────────────────────────────────────────────
export type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export type TransactionType =
  | 'EARNED'
  | 'REDEEMED'
  | 'BONUS'
  | 'EXPIRED'
  | 'ADJUSTED'
  | 'TIER_BONUS';

// ── LoyaltyAccount (mirrors LoyaltyAccount.java) ──────────────────
export interface LoyaltyAccount {
  id:                   number;
  memberNumber:         string;       // SKY-00001234
  passengerId:          number;
  passengerName:        string;
  passengerEmail:       string;
  passportNumber:       string;
  phoneNumber:          string;
  totalPointsEarned:    number;
  totalPointsRedeemed:  number;
  availablePoints:      number;
  expiringPoints:       number;
  pointsExpiryDate:     string | null;
  tier:                 LoyaltyTier;
  tierQualifyingPoints: number;
  tierExpiryDate:       string | null;
  totalFlightsTaken:    number;
  totalMilesFlown:      number;
  lastActivityDate:     string | null;
  lastFlightNumber:     string | null;
  isActive:             boolean;
  enrolledDate:         string;
  createdAt:            string;
  updatedAt:            string;
}

// ── LoyaltyTransaction (mirrors LoyaltyTransaction.java) ──────────
export interface LoyaltyTransaction {
  id:                  number;
  accountId:           number;
  passengerId:         number;
  passengerName:       string;
  memberNumber:        string;
  transactionType:     TransactionType;
  pointsAmount:        number;       // positive=earn, negative=redeem/expire
  balanceAfter:        number;
  bookingId:           number | null;
  bookingReference:    string | null;
  flightNumber:        string | null;
  flightRoute:         string | null;
  classType:           string | null;
  distanceKm:          number | null;
  tierMultiplier:      number;
  redemptionValue:     number | null;
  redemptionReference: string | null;
  description:         string;
  createdAt:           string;
  createdBy:           string | null;
}

// ── Stats (matches LoyaltyDTO.LoyaltyStats) ───────────────────────
export interface LoyaltyStats {
totalRedeemedValueUSD: number|undefined;
  totalMembers:          number;
  bronzeCount:           number;
  silverCount:           number;
  goldCount:             number;
  platinumCount:         number;
  totalPointsEverIssued: number;
  totalPointsRedeemed:   number;
  totalAvailablePoints:  number;
  totalRedeemedValueBDT: number;
}

// ── Redemption Preview ────────────────────────────────────────────
export interface RedemptionPreview {
  pointsToRedeem:   number;
  availablePoints:  number;
  discountValueBDT: number;
  remainingPoints:  number;
}

// ── Request DTOs ──────────────────────────────────────────────────
export interface EnrollRequest {
  passengerId:    number;
  passengerName:  string;
  passengerEmail: string;
  passportNumber: string;
  phoneNumber:    string;
}

export interface AwardRequest {
  bookingId?:        number;
  bookingReference?: string;
  flightNumber?:     string;
  origin?:           string;
  destination?:      string;
  classType?:        string;
  distanceKm?:       number;
  description?:      string;
}

export interface RedeemRequest {
  pointsToRedeem:    number;
  bookingReference?: string;
}

export interface BonusRequest {
  bonusPoints: number;
  reason:      string;
}

// ── UI Metadata ───────────────────────────────────────────────────
export interface TierMeta {
  label:       string;
  color:       string;
  bg:          string;
  border:      string;
  gradient:    string;
  icon:        string;
  minPoints:   number;
  maxPoints:   number | null;
  multiplier:  string;
  perks:       string[];
}

export const TIER_META: Record<LoyaltyTier, TierMeta> = {
  BRONZE: {
    label:     'Bronze',
    color:     '#cd7f32',
    bg:        'rgba(205,127,50,.15)',
    border:    'rgba(205,127,50,.35)',
    gradient:  'linear-gradient(135deg,#cd7f32,#a0522d)',
    icon:      'fa-medal',
    minPoints: 0,
    maxPoints: 999,
    multiplier:'1×',
    perks:     ['Priority check-in', 'Welcome bonus 0 pts', 'Base earn rate']
  },
  SILVER: {
    label:     'Silver',
    color:     '#b0b8c8',
    bg:        'rgba(176,184,200,.15)',
    border:    'rgba(176,184,200,.35)',
    gradient:  'linear-gradient(135deg,#b0b8c8,#8a9db5)',
    icon:      'fa-award',
    minPoints: 1000,
    maxPoints: 4999,
    multiplier:'1.25×',
    perks:     ['Priority boarding', '500 enrollment bonus', '25% more points', 'Lounge access (1 visit/yr)']
  },
  GOLD: {
    label:     'Gold',
    color:     '#ffd700',
    bg:        'rgba(255,215,0,.12)',
    border:    'rgba(255,215,0,.35)',
    gradient:  'linear-gradient(135deg,#ffd700,#f39c12)',
    icon:      'fa-trophy',
    minPoints: 5000,
    maxPoints: 9999,
    multiplier:'1.5×',
    perks:     ['Business upgrade priority', '1500 enrollment bonus', '50% more points', 'Lounge access (4 visits/yr)', 'Dedicated check-in']
  },
  PLATINUM: {
    label:     'Platinum',
    color:     '#a0c4ff',
    bg:        'rgba(160,196,255,.12)',
    border:    'rgba(160,196,255,.35)',
    gradient:  'linear-gradient(135deg,#a0c4ff,#7b9fd4)',
    icon:      'fa-crown',
    minPoints: 10000,
    maxPoints: null,
    multiplier:'2×',
    perks:     ['Guaranteed upgrade', '5000 enrollment bonus', '2× earn rate', 'Unlimited lounge access', 'Personal concierge', 'Fast-track security']
  }
};

export const TX_META: Record<TransactionType, { color: string; icon: string; label: string }> = {
  EARNED:     { color: '#2ed573', icon: 'fa-plus-circle',     label: 'Points Earned'  },
  REDEEMED:   { color: '#ff9f43', icon: 'fa-minus-circle',    label: 'Points Redeemed'},
  BONUS:      { color: '#a29bfe', icon: 'fa-star',            label: 'Bonus Award'    },
  EXPIRED:    { color: '#ff4757', icon: 'fa-clock',           label: 'Points Expired' },
  ADJUSTED:   { color: '#00b4d8', icon: 'fa-edit',            label: 'Adjustment'     },
  TIER_BONUS: { color: '#ffd700', icon: 'fa-trophy',          label: 'Tier Bonus'     },
};