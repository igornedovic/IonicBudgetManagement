import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';

import { TransactionType } from './transaction.model';
import { TransactionService } from './transaction.service';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.page.html',
  styleUrls: ['./new-transaction.page.scss'],
})
export class NewTransactionPage implements OnInit {
  transactionTypes = Object.values(TransactionType);
  title: string;
  transactionId: string;
  type: string;
  purpose: string;
  amount: string;
  date: string;
  pictureUrl: string;

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      const state = this.router.getCurrentNavigation().extras.state;
      
    }
  }

  ngOnInit() {}

  ionViewWillEnter() {
    if (history.state) {
      this.title = history.state.title;
      this.transactionId = history.state.id;
      this.type = history.state.type;
      this.purpose = history.state.purpose;
      this.amount = history.state.amount;
      this.date = history.state.date;
      this.pictureUrl = history.state.pictureUrl;
    }
  }

  onAddTransaction(transactionForm: NgForm) {
    this.loadingCtrl
      .create({
        message: 'Adding transaction...',
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.transactionService
          .addTransaction(transactionForm.value)
          .subscribe(() => {
            loadingEl.dismiss();
            transactionForm.reset();
            this.router.navigate(['/home']);
          });
      });
  }

  onUpdateTransaction(transactionForm: NgForm) {
    this.loadingCtrl
      .create({
        message: 'Updating transaction...',
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.transactionService
          .updateTransaction(this.transactionId, transactionForm.value)
          .subscribe(() => {
            loadingEl.dismiss();
            transactionForm.reset();
            this.router.navigate(['/home']);
          });
      });
  }
}
