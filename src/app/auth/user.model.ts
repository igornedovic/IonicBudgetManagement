export class User {
  constructor(
    public id: string,
    public email: string,
    private _token: string,
    private _tokenExpirationDate: Date,
    public firstName?: string,
    public lastName?: string
  ) {}

  get token() {
    if (!this._tokenExpirationDate || this._tokenExpirationDate <= new Date()) {
      return null;
    }

    return this._token;
  }

  set firstN(firstName: string) {
    this.firstName = firstName;
  }

  set lastN(lastName: string) {
    this.lastName = lastName;
  }
}
