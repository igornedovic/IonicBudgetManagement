import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { User } from './user.model';
import { BehaviorSubject, from } from 'rxjs';
import { Storage } from '@capacitor/storage';

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
            userForm.lastName
          );

          return this.http.post<{ name: string }>(
            `https://budget-management-3ca84-default-rtdb.europe-west1.firebasedatabase.app/users.json?auth=${user.token}`,
            {
              firstName: user.firstName,
              lastName: user.lastName,
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
    let expirationTime: Date;
    let token: string;

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
          expirationTime = new Date(
            new Date().getTime() + +userData.expiresIn * 1000
          );

          token = userData.idToken;

          user = new User(
            userData.localId,
            userData.email,
            userData.idToken,
            expirationTime
          );

          return this.http.get<UserData>(
            `https://budget-management-3ca84-default-rtdb.europe-west1.firebasedatabase.app/users.json?orderBy="userId"&equalTo="${user.id}"&auth=${user.token}`
          );
        }),
        map((additionalUserData) => {
          for (const key in additionalUserData) {
            if (additionalUserData.hasOwnProperty(key)) {
              user.firstN = additionalUserData[key].firstName;
              user.lastN = additionalUserData[key].lastName;
            }
          }

          this._user.next(user);

          this.storeAuthData(
            user.id,
            user.email,
            token,
            expirationTime.toISOString(),
            user.firstName,
            user.lastName
          );
        })
      );
  }

  autoLogin() {
    return from(Storage.get({ key: 'authData' })).pipe(
      map((storedData) => {
        if (!storedData || !storedData.value) {
          return null;
        }

        const parsedData = JSON.parse(storedData.value) as {
          userId: string;
          email: string;
          token: string;
          tokenExpirationDate: string;
          firstName: string;
          lastName: string;
        };

        const expirationDate = new Date(parsedData.tokenExpirationDate);

        if (expirationDate <= new Date()) {
          return null;
        }

        const user = new User(
          parsedData.userId,
          parsedData.email,
          parsedData.token,
          expirationDate,
          parsedData.firstName,
          parsedData.lastName
        );

        return user;
      }),
      tap((user) => {
        if (user) {
          this._user.next(user);
        }
      }),
      map((user) => {
        return !!user;
      })
    );
  }

  private storeAuthData(
    userId: string,
    email: string,
    token: string,
    tokenExpirationDate: string,
    firstName: string,
    lastName: string
  ) {
    const data = JSON.stringify({
      userId: userId,
      email: email,
      token: token,
      tokenExpirationDate: tokenExpirationDate,
      firstName: firstName,
      lastName: lastName,
    });
    Storage.set({ key: 'authData', value: data });
  }

  logout() {
    this._user.next(null);
  }
}
