import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string;
  exp: number;
  email?: string;
  UserId?: string;
  StoreId: string;
  StoreName?: string;
  FirstName?: string;
  LastName?: string;
  UserName?: string;
  UserClassification?: string;
  UserType?: string;
  Type?:string;
  role?: string[];
  [key: string]: any;
}
@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private apiUrl: string = environment.baseUrl;
  private loginUrl: string = 'Login/LoginUser';
  private verifyOtpUrl: string = 'Login/ValidateOtp';
  private forgotPasswordUrl: string = 'User/ForgotPassword';

  private userSubject = new BehaviorSubject<JwtPayload | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
      
    const token = this.getToken();
    if (token && !this.isTokenExpired(token)) {
      const user = this.decodeToken(token);
      this.userSubject.next(user);
      //this.scheduleAutoLogout(token);
    } else if(token && this.isTokenExpired(token)) {
      this.generateAccessTokenFromRefreshToken(localStorage.getItem('refreshToken') || '').subscribe((res:any)=>{
        if(res.statusCode == 200) {
          this.setToken(res.accessToken, res.refreshToken);
          const user = this.decodeToken(res.accessToken);
          this.userSubject.next(user);
        } else {
          this.logout();
        }
      })
    }
  }

  // API: login
  loginUser(loginObject: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${this.loginUrl}`, loginObject);
  }

  // API: verify OTP
  verifyOtp(otpObject: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${this.verifyOtpUrl}`, otpObject);
  }

  // Token operations
  setToken(token: string,refreshToken:any): void {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    const user = this.decodeToken(token);
    this.userSubject.next(user);
    console.log('Decoded User:', this.userSubject);
    //this.scheduleAutoLogout(token);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  decodeToken(token: string): JwtPayload {
    return jwtDecode<JwtPayload>(token);
  }

  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    return decoded.exp * 1000 < Date.now();
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.userSubject.next(null);
    this.router.navigate(['']);
  }

  getUser(): JwtPayload | null {
    return this.userSubject.value;
  }

  setUser(user: JwtPayload): void {
    this.userSubject.next(user);
  }
  // Auto-logout when token expires
  // private scheduleAutoLogout(token: string): void {
  //   const decoded = this.decodeToken(token);
  //   const expiresIn = decoded.exp * 1000 - Date.now();

  //   setTimeout(() => {
  //     this.logout();
  //   }, expiresIn);
  // }

  generateAccessTokenFromRefreshToken(refreshToken: string): Observable<any> {
     
    return this.http.get<any>(`${this.apiUrl}Login/GenerateAccessTokenFromRefreshToken?refreshToken=${refreshToken}`);
  }

  forgotPassword(forgotPasswordObject:any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl + this.forgotPasswordUrl}`,  forgotPasswordObject );
  }
}
