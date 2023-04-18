/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { shareReplay, tap } from 'rxjs';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private webService: WebRequestService,
    private router: Router,
    private http: HttpClient
  ) { }

  login (email: string, password: string) {
    return this.webService.login(email, password)
      .pipe(
        shareReplay(),
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
        shareReplay(),
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

  getAccessToken () {
    return sessionStorage.getItem('x-access-token');
  }

  setAccessToken (accessToken: string | null) {
    sessionStorage.setItem('x-access-token', accessToken!);
  }

  getRefreshToken () {
    console.log('authService.getRefreshToken: ', sessionStorage.getItem('x-refresh-token'));
    return sessionStorage.getItem('x-refresh-token');
  }

  getUserId () {
    console.log('authService.getUserId: ', sessionStorage.getItem('user-id'));
    return sessionStorage.getItem('user-id');
  }

  private setSession (userId: string, accessToken: string, refreshToken: string) {
    sessionStorage.setItem('user-id', userId);
    sessionStorage.setItem('x-access-token', accessToken);
    sessionStorage.setItem('x-refresh-token', refreshToken);
  }

  removeSession () {
    sessionStorage.removeItem('user-id');
    sessionStorage.removeItem('x-access-token');
    sessionStorage.removeItem('x-refresh-token');
    this.router.navigateByUrl('/login');
  }

  getNewAccessToken () {
    return this.http.get(
      `${this.webService.ROOT_URL}/users/me/access-token`, {
        headers: {
          'x-refresh-token': this.getRefreshToken()!,
          '_id': this.getUserId()!
      },
      observe: 'response'
  }).pipe(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tap((res: HttpResponse<any>) => {
      this.setAccessToken(res.headers.get('x-access-token'))
    })
  )
  }

}
