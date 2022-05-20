import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.page.html',
  styleUrls: ['./new-transaction.page.scss'],
})
export class NewTransactionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  onAddTransaction(transactionForm: NgForm) {
    console.log(transactionForm);
  }
}
