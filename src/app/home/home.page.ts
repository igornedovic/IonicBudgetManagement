import { Component, OnDestroy, OnInit } from '@angular/core';
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
  private transactionSub: Subscription;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.transactionSub = this.transactionService
      .getTransactions()
      .subscribe((transactions) => {
        this.transactions = transactions;
      });
  }

  ngOnDestroy() {
    if (this.transactionSub) {
      this.transactionSub.unsubscribe();
    }
  }
}
