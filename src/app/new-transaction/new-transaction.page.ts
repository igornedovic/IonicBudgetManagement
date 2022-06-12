import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
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
  transactionForm: FormGroup;

  transactionTypes = Object.values(TransactionType);
  title: string;
  transactionId: string;
  type: string;
  purpose: string;
  amount: number;
  date: string;
  pictureUrl: string;

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController
  ) {}

  ngOnInit() {
    this.transactionForm = new FormGroup({
      type: new FormControl('', Validators.required),
      purpose: new FormControl('', Validators.required),
      amount: new FormControl('', [
        Validators.required,
        Validators.min(1),
      ]),
      date: new FormControl('', Validators.required),
      pictureUrl: new FormControl('', Validators.required),
    });
  }

  ionViewWillEnter() {
    if (history.state) {
      this.title = history.state.title;
      this.transactionId = history.state.id;
      this.type = history.state.type;
      this.purpose = history.state.purpose;
      this.amount = history.state.amount;
      this.date = history.state.date;
      this.pictureUrl = history.state.pictureUrl;

      this.transactionForm.get('type').setValue(this.type);
      this.transactionForm.get('purpose').setValue(this.purpose);
      this.transactionForm.get('amount').setValue(this.amount);
      this.transactionForm.get('date').setValue(this.date);
      this.transactionForm.get('pictureUrl').setValue(this.pictureUrl);
    }
  }

  onTypeChange(event) {
    // const type = event.detail.value;

    // if (this.transactionForm.get('type').value == this.transactionTypes[1]) {
    //   this.transactionForm.get('amount').addValidators(Validators.max(5000));
    // } else if (this.transactionForm.get('amount').hasValidator(Validators.max(5000))) {
    //   this.transactionForm.get('amount').clearValidators();
    // }
  }

  onAddTransaction() {
    this.loadingCtrl
      .create({
        message: 'Adding transaction...',
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.transactionService
          .addTransaction(this.transactionForm.value)
          .subscribe(() => {
            loadingEl.dismiss();
            this.transactionForm.reset();
            this.router.navigate(['/home']);
          });
      });
  }

  onUpdateTransaction() {
    this.loadingCtrl
      .create({
        message: 'Updating transaction...',
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.transactionService
          .updateTransaction(this.transactionId, this.transactionForm.value)
          .subscribe(() => {
            loadingEl.dismiss();
            this.transactionForm.reset();
            this.router.navigate(['/home']);
          });
      });
  }
}
