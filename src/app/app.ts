
import { Component, OnInit } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationEnd
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

import { Navbar } from './components/navbar/navbar';
import { Sidebar } from './components/sidebar/sidebar';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Navbar,
    Sidebar,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  isLoggedIn =
    localStorage.getItem('supplier-management-authenticated') === 'true';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        this.isLoggedIn =
          localStorage.getItem('supplier-management-authenticated') === 'true';

        const url = (event as NavigationEnd).urlAfterRedirects;

        // Demo-only: send logged-out users to Login.
        if (!this.isLoggedIn && url !== '/login') {
          this.router.navigate(['/login']);
        }
      });
  }
}
