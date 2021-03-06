import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { Transaction } from './transaction.model';
import { TransactionType } from './transaction.model';

interface TransactionData {
  type: TransactionType;
  purpose: string;
  amount: number;
  date: Date;
  imageUrl: string;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private _transactions = new BehaviorSubject<Transaction[]>([]);
  private _balance = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient, private authService: AuthService) {}

  get transactions() {
    return this._transactions.asObservable();
  }

  get balance() {
    return this._balance.asObservable();
  }

  uploadImage(imageFile: File) {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "tnzfsbju");

    return this.http.post<{url: string}>("https://api.cloudinary.com/v1_1/dosbawfen/image/upload", formData);
  }

  addTransaction(transactionData: TransactionData, imageUrl: string) {
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
          +transactionData.amount,
          new Date(transactionData.date),
          imageUrl,
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
        const newTransactions = transations.concat(newTransaction)
        this._transactions.next(newTransactions);
        this.changeBalance(newTransactions);
      })
    );
  }

  getTransactions() {
    let fetchedUserId: string;

    return this.authService.userId.pipe(
      take(1),
      switchMap((userId) => {
        fetchedUserId = userId;
        return this.authService.token;
      }),
      take(1),
      switchMap((token) => {
        return this.http.get<{ [key: string]: TransactionData }>(
          `https://budget-management-3ca84-default-rtdb.europe-west1.firebasedatabase.app/transactions.json?orderBy="userId"&equalTo="${fetchedUserId}"&auth=${token}`
        );
      }),
      map((transactionsResponse) => {
        const transactions: Transaction[] = [];

        for (const key in transactionsResponse) {
          if (transactionsResponse.hasOwnProperty(key)) {
            transactions.push(
              new Transaction(
                key,
                transactionsResponse[key].type,
                transactionsResponse[key].purpose,
                +transactionsResponse[key].amount,
                new Date(transactionsResponse[key].date),
                transactionsResponse[key].imageUrl,
                transactionsResponse[key].userId
              )
            );
          }
        }

        return transactions;
      }),
      tap((transactions) => {
        this._transactions.next(transactions);
        this.changeBalance(transactions);
      })
    );
  }

  updateTransaction(id: string, transactionData: TransactionData) {
    let updatedTransactions: Transaction[];
    let fetchedToken: string;
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        fetchedToken = token;
        return this.transactions;
      }),
      take(1),
      switchMap((transactions) => {
        if (!transactions || transactions.length <= 0) {
          return this.getTransactions();
        } else {
          return of(transactions);
        }
      }),
      switchMap((transactions) => {
        const updatedTransactionIndex = transactions.findIndex(
          (pl) => pl.id === id
        );
        updatedTransactions = [...transactions];
        const oldTransaction = updatedTransactions[updatedTransactionIndex];
        updatedTransactions[updatedTransactionIndex] = new Transaction(
          id,
          transactionData.type,
          transactionData.purpose,
          +transactionData.amount,
          new Date(transactionData.date),
          transactionData.imageUrl,
          oldTransaction.userId
        );
        return this.http.put(
          `https://budget-management-3ca84-default-rtdb.europe-west1.firebasedatabase.app/transactions/${id}.json?auth=${fetchedToken}`,
          { ...updatedTransactions[updatedTransactionIndex], id: null }
        );
      }),
      tap(() => {
        this._transactions.next(updatedTransactions);
        this.changeBalance(updatedTransactions);
      })
    );
  }

  deleteTransaction(transactionId: string) {
    return this.authService.token.pipe(
      take(1),
      switchMap((token) => {
        return this.http.delete(
          `https://budget-management-3ca84-default-rtdb.europe-west1.firebasedatabase.app/transactions/${transactionId}.json?auth=${token}`
        );
      }),
      switchMap(() => {
        return this.transactions;
      }),
      take(1),
      tap((transactions) => {
        const newTransactions = transactions.filter(
          (t) => t.id !== transactionId
        );
        this._transactions.next(newTransactions);
        this.changeBalance(newTransactions);
      })
    );
  }

  changeBalance(transactions: Transaction[]) {
    let newBalance = 0;

    transactions.forEach((t) => {
      if (t.type === TransactionType.Deposit) {
        newBalance += t.amount;
      } else {
        newBalance -= t.amount;
      }
    });
    
    this._balance.next(newBalance);
  }
}
