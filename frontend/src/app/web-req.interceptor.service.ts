/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptor implements HttpInterceptor {

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
          console.log(err);
          return throwError(() => err);
        })
      )
  } 

  addAuthHeader (request: any) {
    // Get the access token.
    const token = this.authService.getAccessToken;

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
