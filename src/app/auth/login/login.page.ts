import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {}

  onLogin(loginForm: NgForm) {
    this.isLoading = true;

    if (loginForm.valid) {
      this.authService.login(loginForm.value).subscribe(
        (response) => {

          this.isLoading = false;
          this.router.navigateByUrl('/home');
        },
        (error) => {
          console.log(error);

          this.isLoading = false;
          let message = 'Incorrect email or password!';

          this.alertCtrl
            .create({
              header: 'Authentification failed',
              message,
              buttons: ['Okay'],
            })
            .then((alert) => {
              alert.present();
            });
        }
      );

      loginForm.reset();
    }
  }
}
