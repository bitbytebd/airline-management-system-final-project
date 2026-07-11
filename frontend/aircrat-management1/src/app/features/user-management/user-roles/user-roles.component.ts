import { Component, OnInit } from '@angular/core';

interface RolePolicy {
  role: string;
  level: string;
  color: string;
  description: string;
  permissions: string[];
}

@Component({
  selector: 'app-user-roles',
  templateUrl: './user-roles.component.html',
  styleUrls: ['./user-roles.component.css']
})
export class UserRolesComponent implements OnInit {
  roles: RolePolicy[] = [
    { role: 'SUPER_ADMIN', level: 'Executive control', color: '#7c3aed', description: 'Owns security, platform configuration, and final operational authority.', permissions: ['All modules', 'Delete records', 'Role assignment', 'System audit'] },
    { role: 'ADMIN', level: 'Operations control', color: '#0284c7', description: 'Manages day-to-day airline operations and approved administrative workflows.', permissions: ['Booking', 'Flight', 'Payment', 'User management'] },
    { role: 'MANAGER', level: 'Commercial control', color: '#059669', description: 'Reviews pricing, revenue, reports, and operational performance dashboards.', permissions: ['Pricing', 'Revenue', 'Reports', 'Waitlist'] },
    { role: 'AGENT', level: 'Front desk control', color: '#d97706', description: 'Handles passenger-facing workflows like booking, ticketing, and support.', permissions: ['Booking', 'Passenger', 'Coupon validation', 'Tracking'] },
    { role: 'VIEWER', level: 'Read only', color: '#64748b', description: 'Can inspect dashboards and reports without mutating operational data.', permissions: ['Dashboard', 'Reports', 'Flight status', 'Read-only records'] }
  ];

  constructor() { }

  ngOnInit(): void { }
}
