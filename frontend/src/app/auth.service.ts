import { HttpResponse } from '@angular/common/http';
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
    private router: Router
  ) { }

  login (email: string, password: string) {
    return this.webService.login(email, password)
      .pipe(
        shareReplay(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tap((res: HttpResponse<any>) => {
          // The auth tokens will be in the header of this response
          this.setSession(res.body._id, res.headers.get('x-access-token') || '', res.headers.get('x-refresh-token') || '');
        })
      );
  }

  logout () {
    this.removeSession();
  }

  getAccessToken () {
    return localStorage.getItem('access-token');
  }

  setAccessToken (accessToken: string) {
    localStorage.setItem('access-token', accessToken);
  }

  getRefreshToken () {
    return localStorage.getItem('refresh-token');
  }

  private setSession (userId: string, accessToken: string, refreshToken: string) {
    localStorage.setItem('user-id', userId);
    localStorage.setItem('access-token', accessToken);
    localStorage.setItem('refresh-token', refreshToken);
  }

  private removeSession () {
    localStorage.removeItem('user-id');
    localStorage.removeItem('access-token');
    localStorage.removeItem('refresh-token');
  }

}