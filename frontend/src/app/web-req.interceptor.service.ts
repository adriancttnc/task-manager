/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, empty, Observable, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

  refreshingAccessToken = false;

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
          if (err.status === 401 && !this.refreshingAccessToken) {
            // 401 error - we are unauthorized.

            // Refresh the access token. If that fails, then logout.
            return this.refreshAccessToken()
              .pipe(
                switchMap(() => {
                  request = this.addAuthHeader(request);
                  return next.handle(request);
                }),
                catchError(() => {
                  this.authService.logout();
                  return empty();
                })
              )
          }
          return throwError(() => err);
        })
      )
  }

  refreshAccessToken () {
    this.refreshingAccessToken = true;
    // We want to call a function in the auth service to send a request to refresh the access token.
    return this.authService.getNewAccessToken()
      .pipe(
        tap(() => {
          console.log('Access Token Refreshed');
          this.refreshingAccessToken = false;
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
