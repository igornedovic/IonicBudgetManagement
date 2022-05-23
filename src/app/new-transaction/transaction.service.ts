import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { Transaction } from './transaction.model';
import { TransactionType } from './transaction.model';

interface TransactionData {
  type: TransactionType;
  purpose: string;
  amount: number;
  date: Date;
  pictureUrl: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private _transactions = new BehaviorSubject<Transaction[]>([]);

  constructor(private http: HttpClient, private authService: AuthService) {}

  get transactions() {
    return this._transactions.asObservable();
  }

  addTransaction(transactionData: TransactionData) {
    let fetchedUserId: string;
    let newTransaction: Transaction;
    let generatedId: string;

    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {
        newTransaction = new Transaction(
          null,
          transactionData.type,
          transactionData.purpose,
          transactionData.amount,
          transactionData.date,
          transactionData.pictureUrl,
          fetchedUserId
        );
        return this.http.post<{ name: string }>(
          `https://budget-management-3ca84-default-rtdb.europe-west1.firebasedatabase.app/transactions.json?auth=${token}`,
          newTransaction
        );
      }),
      take(1),
      switchMap((response) => {
        generatedId = response.name;
        return this.transactions;
      }),
      take(1),
      tap((transations) => {
        newTransaction.id = generatedId;
        this._transactions.next(transations.concat(newTransaction));
      })
    );
  }
}
