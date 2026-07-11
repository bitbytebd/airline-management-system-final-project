import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'aircrat-management';
  isPublicRoute = false;

  constructor(private router: Router) {
    this.setShell(router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => this.setShell((event as NavigationEnd).urlAfterRedirects));
  }

  private setShell(url: string): void {
    const path = (url || '/').split('?')[0].split('#')[0];
    this.isPublicRoute = path === '/' ||
      path === '/home' ||
      path.startsWith('/user-portal') ||
      path.startsWith('/flights/search') ||
      path.startsWith('/public-booking') ||
      path.startsWith('/booking-status') ||
      path.startsWith('/public-payment') ||
      path.startsWith('/flight-tracker') ||
      path.startsWith('/auth');
  }
}
