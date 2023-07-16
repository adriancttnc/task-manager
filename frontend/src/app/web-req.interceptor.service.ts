/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, of, Subject, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { ERROR_CODES } from '@errorEnums';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

  refreshingAccessToken = false;

  accessTokenRefreshed: Subject<any> = new Subject();

  constructor (
    private authService: AuthService
  ) {}

  intercept (request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    // Handle the request.
    request = this.addAuthHeader(request);

    // Call next() and handle the response.
    return next.handle(request)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.error.errorCode === ERROR_CODES.ACCESS_TOKEN_EXPIRED) {
            // 10004 - access code has expired.

            // Refresh the access token. If that fails, then logout.
            return this.authService.getNewAccessToken()
              .pipe(
                switchMap(() => {
                  request = this.addAuthHeader(request);
                  return next.handle(request);
                }),
                catchError(() => {
                  this.authService.removeSession();
                  return of();
                })
              );
          }
          this.authService.removeSession();
          return of();
        })
      )
  }

  addAuthHeader (request: any) {
    // Get the access token.
    const token = this.authService.getAccessToken();

    if (token) {
      // Append the access token to the request header.
      return request.clone({
        setHeaders: {
          'x-access-token': token
        }
      })
    }
    return request;
  }
}
