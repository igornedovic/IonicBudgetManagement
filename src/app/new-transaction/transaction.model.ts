export class Transaction {
  constructor(
    public id: string,
    public type: TransactionType,
    public purpose: string,
    public amount: number,
    public date: Date,
    public imageUrl: string,
    public userId: string
  ) {}
}

export enum TransactionType {
  Deposit = 'Deposit',
  Withdrawal = 'Withdrawal',
}
