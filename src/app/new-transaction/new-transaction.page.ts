import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

import { TransactionType } from './transaction.model';
import { TransactionService } from './transaction.service';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.page.html',
  styleUrls: ['./new-transaction.page.scss'],
})
export class NewTransactionPage implements OnInit {
  transactionTypes = Object.values(TransactionType);

  constructor(private transactionService: TransactionService) { }

  ngOnInit() {
  }

  onAddTransaction(transactionForm: NgForm) {
    this.transactionService.addTransaction(transactionForm.value).subscribe(response => {
      console.log(response);
    })
  }
}
