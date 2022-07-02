import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  showTabs = false;
  previousAuthState = false;
  private authSub: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authSub = this.authService.isUserAutheticated.subscribe(isAuthenticated => {
      if (!isAuthenticated && this.previousAuthState !== isAuthenticated) {   
         window.location.href = '/login';
      }

      this.previousAuthState = isAuthenticated;
      this.showTabs = isAuthenticated;
    })
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }
}
