import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { User } from './user.model';
import { BehaviorSubject } from 'rxjs';

interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

interface UserData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  balance?: number;
  userId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _user = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient) {}

  get isUserAutheticated() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return !!user.token;
        } else {
          return false;
        }
      })
    );
  }

  get userId() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.id;
        } else {
          return null;
        }
      })
    );
  }

  get token() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user.token;
        } else {
          return null;
        }
      })
    );
  }

  get user() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (user) {
          return user;
        } else {
          return null;
        }
      })
    );
  }

  register(userForm: UserData) {
    let user: User;

    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
        {
          email: userForm.email,
          password: userForm.password,
          returnSecureToken: true,
        }
      )
      .pipe(
        take(1),
        switchMap((userData) => {
          const expirationTime = new Date(
            new Date().getTime() + +userData.expiresIn * 1000
          );
          user = new User(
            userData.localId,
            userData.email,
            userData.idToken,
            expirationTime,
            userForm.firstName,
            userForm.lastName,
            0
          );

          return this.http.post<{ name: string }>(
            `https://budget-management-3ca84-default-rtdb.europe-west1.firebasedatabase.app/users.json?auth=${user.token}`,
            {
              firstName: user.firstName,
              lastName: user.lastName,
              balance: user.balance,
              userId: user.id,
            }
          );
        }),
        take(1),
        tap(() => {
          this._user.next(user);
        })
      );
  }

  login(userForm: UserData) {
    let user: User;

    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`,
        {
          email: userForm.email,
          password: userForm.password,
          returnSecureToken: true,
        }
      )
      .pipe(
        take(1),
        switchMap((userData) => {
          const expirationTime = new Date(
            new Date().getTime() + +userData.expiresIn * 1000
          );

          user = new User(
            userData.localId,
            userData.email,
            userData.idToken,
            expirationTime,
          );

          return this.http.get<UserData>(
            `https://budget-management-3ca84-default-rtdb.europe-west1.firebasedatabase.app/users.json?orderBy="userId"&equalTo="${user.id}"&auth=${user.token}`
          );
          
        }),
        map(additionalUserData => {

          for (const key in additionalUserData) {
            if (additionalUserData.hasOwnProperty(key)) {
              user.firstN = additionalUserData[key].firstName;
              user.lastN = additionalUserData[key].lastName;
              user.bal = additionalUserData[key].balance;
            }
          }

          this._user.next(user);
        })
      );
  }

  logout() {
    this._user.next(null);
  }
}
