/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, of, tap } from 'rxjs';
import { WebRequestService } from './web-request.service';
import { SnackbarService } from './shared/services/snackbar.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private webService: WebRequestService,
    private router: Router,
    private http: HttpClient,
    private _snackBarService: SnackbarService
  ) {}

  login (email: string, password: string) {
    return this.webService.login(email, password)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tap((res: HttpResponse<any>) => {
          // The auth tokens will be in the header of this response
          this.setSession(
            res.body._id,
            res.headers.get('x-access-token') || '',
            res.headers.get('x-refresh-token') || ''
          );
          this.router.navigateByUrl('/lists');
        })
      );
  }
  
  signup (email: string, password: string) {
    return this.webService.signup(email, password)
      .pipe(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tap((res: HttpResponse<any>) => {
          // The auth tokens will be in the header of this response
          this.setSession(
            res.body._id,
            res.headers.get('x-access-token') || '',
            res.headers.get('x-refresh-token') || ''
          );
          this.router.navigateByUrl('/lists');
        })
      )
  }

  logout () {
    const headers = new HttpHeaders({
      'x-refresh-token': this.getRefreshToken()!,
      '_id': this.getUserId()!
    });
    return this.http.post(`${this.webService.ROOT_URL}/users/logout`, {}, { headers: headers })
      .subscribe((res: any) => {
        if (res.status ===  200) {
          this.removeSession();
        }
      });
  }

  forgotPassword (email: string) {
    return this.webService.forgotPassword(email)
      .subscribe((res: any) => {
        console.log('forgotPassword res:', res);
        if (res.status ===  200) {
          // Show notification here.
          this.router.navigateByUrl('/login');
          this._snackBarService.success({
            title: 'Success',
            message: 'If we can find your email you will receive a link to reset your password.',
            duration: 20000
          });
        }
        return res;
      });
  }

  resetPassword (key: string, password: string, confirmPassword: string) {
    return this.webService.resetPassword(key, password, confirmPassword)
      .subscribe((res: any) => {
        if (res.status === 200) {
          this.router.navigateByUrl('/login');
          this._snackBarService.success({
            title: 'Success',
            message: 'Password has been changed successfully',
            duration: 20000
          });
        }
        return res;
      })
  }

  getAccessToken () {
    return localStorage.getItem('x-access-token');
  }

  setAccessToken (accessToken: string | null) {
    localStorage.setItem('x-access-token', accessToken!);
  }

  getRefreshToken () {
    return localStorage.getItem('x-refresh-token');
  }

  getUserId () {
    return localStorage.getItem('user-id');
  }

  private setSession (userId: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('user-id', userId);
    localStorage.setItem('x-access-token', accessToken);
    localStorage.setItem('x-refresh-token', refreshToken);
  }

  removeSession () {
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
    this.router.navigateByUrl('/login');
  }

  getNewAccessToken () {
    return this.webService.getNewAccessToken(this.getRefreshToken()!, this.getUserId()!)
      .pipe(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tap((res: any) => {
          this.setAccessToken(res.accessToken);
        }),
        catchError(() => {
          return of({});
        })
      )
  }

}
