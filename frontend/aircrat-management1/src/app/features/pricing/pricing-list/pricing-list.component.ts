import { Component, OnInit } from '@angular/core';
import { PricingRule } from 'src/app/core/models/pricing-rule.model';
import { PricingService } from 'src/app/core/services/pricing.service';

@Component({
  selector: 'app-pricing-list',
  templateUrl: './pricing-list.component.html',
  styleUrls: ['./pricing-list.component.css']
})
export class PricingListComponent implements OnInit {
  rules: PricingRule[] = [];
  filtered: PricingRule[] = [];
  query = '';
  loading = true;
  selected: PricingRule | null = null;

  constructor(private pricingService: PricingService) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.pricingService.getRules().subscribe({
      next: rules => {
        this.rules = rules.sort((a, b) => a.origin.localeCompare(b.origin) || a.destination.localeCompare(b.destination));
        this.filtered = this.rules;
        this.selected = this.rules[0] || null;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filter(): void {
    const q = this.query.toLowerCase().trim();
    this.filtered = this.rules.filter(r =>
      !q ||
      r.flightNumber.toLowerCase().includes(q) ||
      r.origin.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q)
    );
  }

  select(rule: PricingRule): void {
    this.selected = rule;
  }

  format(n: number): string {
    return '$' + (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

}
