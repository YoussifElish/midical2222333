import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { signupdata, logindata, ForgetPass, ResetPass,  } from '../../interfaces/data';
import { Environment } from '../../../base/Environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';  

@Injectable({
  providedIn: 'root'
})
export class Authiserviceservice {
  userData = new BehaviorSubject<any>(null);
  token: string | null = null;
  isLoggedIn = false;

  constructor(private _HttpClient: HttpClient, private _Router: Router) {
    this.loadUserData();
  }

  signup(data: signupdata): Observable<any> {
    return this._HttpClient.post(`${Environment.baseurl}/Auth/Register`, data);
  }

  ForgetPass(data: ForgetPass): Observable<any> {
    return this._HttpClient.post(`${Environment.baseurl}/Auth/forget-password`, data);
  }
  
  ResetPass(data: ResetPass): Observable<any> {
    return this._HttpClient.post(`${Environment.baseurl}/Auth/reset-password`, data);
  }

  Doctorsignup(data: FormData ): Observable<any> {
    return this._HttpClient.post(`${Environment.baseurl}/Auth/register-as-doctor`, data ,{responseType:'text'});
  }

  login(data: logindata): Observable<any> {
    return this._HttpClient.post(`${Environment.baseurl}/Auth/Login`, data).pipe(
      tap((response: any) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('userToken', response.token);
        }
        this.decodeUserData();
      })
    );
  }
  

  decodeUserData() {
    if (typeof window === 'undefined') return;
  
    const token = localStorage.getItem('userToken');
    if (token) {
      const decoded = jwtDecode(token);
      this.userData.next(decoded);
      this.isLoggedIn = true;
    }
  }
  
  getToken(): string | null {
    if (typeof window === 'undefined') return this.token;
    return this.token || localStorage.getItem('userToken');
  }
  
  
  logout() {
    localStorage.removeItem('userToken');
    this.userData.next(null);
    this.isLoggedIn = false;
    this._Router.navigate(['/home']);
  }

  loadUserData() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken');
      if (token) {
        this.token = token;
        this.isLoggedIn = true;
        this.decodeUserData(); // Decode and set user data on initial load
      }
    }
  }
}
