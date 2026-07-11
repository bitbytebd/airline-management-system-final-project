import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from 'src/app/core/models/user.model';
import { UserManagementService } from 'src/app/core/services/user-management.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  searchText = '';
  selectedRole = 'All';
  roles = ['All', 'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT', 'VIEWER'];

  constructor(private service: UserManagementService, private router: Router) { }

  ngOnInit(): void {
    this.load();
  }

  get filteredUsers(): User[] {
    const query = this.searchText.trim().toLowerCase();
    return this.users.filter(user => {
      const matchesRole = this.selectedRole === 'All' || user.role === this.selectedRole;
      const matchesQuery = !query || [user.employeeCode, user.fullName, user.username, user.email, user.phoneNumber, user.department, user.station, user.status]
        .some(value => (value || '').toLowerCase().includes(query));
      return matchesRole && matchesQuery;
    });
  }

  get activeCount(): number {
    return this.users.filter(user => user.status === 'Active').length;
  }

  get adminCount(): number {
    return this.users.filter(user => ['SUPER_ADMIN', 'ADMIN'].includes(user.role)).length;
  }

  load(): void {
    this.service.getAll().subscribe(data => this.users = data || []);
  }

  edit(id?: number): void {
    if (id) this.router.navigate(['/users/edit', id]);
  }

  add(): void {
    this.router.navigate(['/users/new']);
  }

  delete(id?: number): void {
    if (id && confirm('Delete this workspace user?')) {
      this.service.delete(id).subscribe(() => this.load());
    }
  }
}
