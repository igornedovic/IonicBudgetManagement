import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';
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
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
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

  register(user: UserData) {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`,
        { email: user.email, password: user.password, returnSecureToken: true }
      )
      .pipe(
        tap((userData) => {
          const expirationTime = new Date(
            new Date().getTime() + +userData.expiresIn * 1000
          );
          const user = new User(
            userData.localId,
            userData.email,
            userData.idToken,
            expirationTime
          );
          this._user.next(user);
        })
      );
  }

  login(user: UserData) {
    return this.http.post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`, {email: user.email, password: user.password, returnSecureToken: true})
      .pipe(
        tap((userData) => {
          const expirationTime = new Date(new Date().getTime() + +userData.expiresIn * 1000);
          const user = new User(userData.localId, userData.email, userData.idToken, expirationTime);
          this._user.next(user);
        })
      )
  }
}
