/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HttpClient, HttpResponse } from '@angular/common/http';
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

  logout () {
    this.removeSession();
    this.router.navigateByUrl('/login');
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

  private removeSession () {
    localStorage.removeItem('user-id');
    localStorage.removeItem('x-access-token');
    localStorage.removeItem('x-refresh-token');
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
