import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  }

  onSubmit(): void {
    this.errorMessage = '';
    const username = this.username.trim();
    if (!username || !this.password) {
      this.errorMessage = 'Username and password are required.';
      return;
    }

    this.loading = true;
    this.authService.login(username, this.password).subscribe({
      next: () => {
        this.loading = false;
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl || this.getRedirectRoute());
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || err?.error?.error || 'Login failed. Please check your credentials.';
      }
    });
  }

  private getRedirectRoute(): string {
    const role = this.authService.getCurrentUserRole();
    switch (role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
      case 'MANAGER':
      case 'STAFF':
        return '/dashboard';
      case 'AGENT':
      case 'BOOKING_AGENT':
        return '/booking';
      case 'ACCOUNTANT':
        return '/report/financial-overview';
      default:
        return '/dashboard';
    }
  }
}
