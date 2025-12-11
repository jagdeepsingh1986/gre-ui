import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
  HttpClient
} from '@angular/common/http';
import { catchError, finalize, Observable, reduce, switchMap } from 'rxjs';
import { throwError } from 'rxjs';
import { LoaderService } from '../../Core/common/loader.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';






export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {


  const loader = inject(LoaderService);
  const http = inject(HttpClient); // Required to call refresh API
  const router = inject(Router);   // Optional, for redirecting on failure
  const toaster = inject(ToastrService);   // Optional, for redirecting on failure

  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const apiUrl = environment.baseUrl;
  loader.show();
//   if (
//   req.url.includes('Login/LoginUser') ||
//   req.url.includes('Login/GenerateAccessTokenFromRefreshToken')
// ) {
//   return next(req);
// }
  let authReq = req;
  if( req.url.includes('Login/LoginUser') ){
    authReq = accessToken
      ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : req;
  }
  else if (req.url.includes('Login/GenerateAccessTokenFromRefreshToken')) {
    authReq = accessToken
      ? req.clone({ setHeaders: { Authorization: `Bearer ${refreshToken}` } })
      : req;
  }
  else{
  authReq = accessToken
      ? req.clone({ setHeaders: { Authorization: `Bearer ${accessToken}` } })
      : req;
  }
 

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If Unauthorized, attempt to refresh token
      if (error.status === 401 && req.url.includes('Login/GenerateAccessTokenFromRefreshToken')) {
        toaster.error('Session expired. Please login again.');
        localStorage.clear();
        router.navigate(['/']);
        return throwError(() => new Error('Unauthorized'));
      }
      if (error.status === 401 && refreshToken) {
        return http
          .get<any>(`${apiUrl}Login/GenerateAccessTokenFromRefreshToken?refreshToken=${refreshToken}`) // Replace with your refresh endpoint
          .pipe(
            switchMap((res) => {
                
              if (res.statusCode == 200) {
                  
                const newAccessToken = res.accessToken;
                localStorage.setItem('accessToken', newAccessToken);

                const newReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newAccessToken}`,
                  },
                });

                return next(newReq); // Retry the original request
              } else {
                // Invalid refresh response — treat like failure
                    
                localStorage.clear();
                toaster.error(res.message);
                router.navigate(['/']);
                return throwError(() => new Error('Token refresh failed'));
              }


            }),
            catchError((refreshErr) => {
              // Refresh failed: logout user or redirect
              localStorage.clear();
              router.navigate(['/']);
              return throwError(() => refreshErr);
            })
          );
      }

      return throwError(() => error); // other errors
    }),
    finalize(() => loader.hide())
  );
};
