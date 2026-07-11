import { Component, OnInit } from '@angular/core';
import { PricingRule, PricingSimulation } from 'src/app/core/models/pricing-rule.model';
import { PricingService } from 'src/app/core/services/pricing.service';

@Component({
  selector: 'app-pricing-simulator',
  templateUrl: './pricing-simulator.component.html',
  styleUrls: ['./pricing-simulator.component.css']
})
export class PricingSimulatorComponent implements OnInit {
  rules: PricingRule[] = [];
  selectedId = 0;
  loadFactor = 72;
  demand = 1.12;
  taxRate = 5;
  simulations: PricingSimulation[] = [];

  constructor(private pricingService: PricingService) { }

  ngOnInit(): void {
    this.pricingService.getRules().subscribe(rules => {
      this.rules = rules;
      this.selectedId = rules[0]?.id || 0;
      this.simulate();
    });
  }

  simulate(): void {
    const rule = this.rules.find(r => r.id === Number(this.selectedId));
    if (!rule) return;
    const cabins = [
      { classType: 'Economy', baseFare: rule.economyPrice },
      { classType: 'Premium', baseFare: rule.premiumPrice },
      { classType: 'Business', baseFare: rule.businessPrice },
      { classType: 'First Class', baseFare: rule.firstClassPrice }
    ];
    this.simulations = cabins.map(cabin => {
      const suggested = this.round(cabin.baseFare * Number(this.demand));
      const tax = this.round(suggested * (Number(this.taxRate) / 100));
      const soldSeats = Math.round((rule.totalSeats || 119) * (Number(this.loadFactor) / 100));
      return {
        classType: cabin.classType,
        baseFare: cabin.baseFare,
        demandMultiplier: Number(this.demand),
        loadFactor: Number(this.loadFactor),
        tax,
        suggestedFare: this.round(suggested + tax),
        projectedRevenue: this.round((suggested + tax) * soldSeats)
      };
    });
  }

  format(n: number): string {
    return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private round(n: number): number {
    return Math.round(n * 100) / 100;
  }

}
