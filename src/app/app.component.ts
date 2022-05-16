import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  showTabs = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.isUserAutheticated.subscribe(isAuthenticated => {
      this.showTabs = isAuthenticated;
    })
  }

  onLogout() {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
