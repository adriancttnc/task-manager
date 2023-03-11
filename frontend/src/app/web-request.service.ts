/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class WebRequestService {

  readonly ROOT_URL = 'http://localhost:3000';

  constructor (
    private http: HttpClient
  ) { }

  get (uri: string) {
    return this.http.get<any>(`${this.ROOT_URL}/${uri}`);
  }
  
  post (uri: string, payload: object) {
    return this.http.post<any>(`${this.ROOT_URL}/${uri}`, payload);
  }
  
  patch (uri: string, payload: object) {
    return this.http.patch<any>(`${this.ROOT_URL}/${uri}`, payload);
  }
  
  delete (uri: string) {
    return this.http.delete<any>(`${this.ROOT_URL}/${uri}`);
  }

  login (email: string, password: string) {
    return this.http.post(`${this.ROOT_URL}/users/login`, {
      email,
      password
    }, {
      observe: 'response'
    });
  }

  signup (email: string, password: string) {
    return this.http.post(`${this.ROOT_URL}/users`, {
      email,
      password
    }, {
      observe: 'response'
    })
  }
}
