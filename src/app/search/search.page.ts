import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { Transaction } from '../new-transaction/transaction.model';
import { TransactionService } from '../new-transaction/transaction.service';
import { SearchModalComponent } from './search-modal/search-modal.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit, OnDestroy {
  transactions: Transaction[];
  searchedTransactions: Transaction[];
  isLoading = false;
  notFound = false;
  private transactionSub: Subscription;

  constructor(
    private modalCtrl: ModalController,
    private transactionService: TransactionService
  ) {}

  ngOnInit() {
    this.transactionSub = this.transactionService.transactions.subscribe(
      (transactions) => {
        this.transactions = transactions;
      }
    );
  }

  openModal() {
    this.modalCtrl
      .create({
        component: SearchModalComponent,
        componentProps: { title: 'Add filters' },
      })
      .then((modal) => {
        modal.present();
        return modal.onDidDismiss();
      })
      .then((modalData) => {
        if (modalData.role === 'confirm') {
          this.searchedTransactions = this.transactions.filter((t) => {
            return (
              t.date.getTime() >= modalData.data.fromDate.getTime() &&
              t.date.getTime() <= modalData.data.toDate.getTime() &&
              t.amount >= modalData.data.range.lower &&
              t.amount <= modalData.data.range.upper
            );
          });

          if (this.searchedTransactions.length === 0) {
            this.notFound = true;
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this.transactionSub) {
      this.transactionSub.unsubscribe();
    }
  }
}
