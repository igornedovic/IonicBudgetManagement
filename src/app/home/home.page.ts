import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  LoadingController,
  NavController,
  RouterLinkWithHrefDelegate,
} from '@ionic/angular';
import { Subscription } from 'rxjs';

import { Transaction } from '../new-transaction/transaction.model';
import { TransactionService } from '../new-transaction/transaction.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
  transactions: Transaction[];
  isLoading = false;
  private transactionSub: Subscription;

  constructor(
    private transactionService: TransactionService,
    private nav: NavController,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.transactionSub = this.transactionService
      .getTransactions()
      .subscribe(() => {
        this.isLoading = false;
      });

    this.transactionSub = this.transactionService.transactions.subscribe(
      (transactions) => {
        this.transactions = transactions;
      }
    );
  }

  onUpdateTransaction(transaction: Transaction) {
    this.nav.navigateForward('/new-transaction', {
      state: {
        title: 'Edit transaction',
        id: transaction.id,
        type: transaction.type,
        purpose: transaction.purpose,
        amount: transaction.amount,
        date: transaction.date.toISOString().slice(0, 10),
        image: transaction.imageUrl,
      },
    });
  }

  onDeleteTransaction(transactionId: string) {
    this.loadingCtrl
      .create({
        message: 'Deleting transaction...',
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.transactionService
          .deleteTransaction(transactionId)
          .subscribe(() => {
            loadingEl.dismiss();
          });
      });
  }

  ngOnDestroy() {
    if (this.transactionSub) {
      this.transactionSub.unsubscribe();
    }
  }
}
