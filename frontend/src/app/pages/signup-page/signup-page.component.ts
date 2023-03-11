import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-signup-page',
  templateUrl: './signup-page.component.html',
  styleUrls: ['./signup-page.component.scss']
})
export class SignupPageComponent {

  constructor (
    private authService: AuthService
  ) {}


  onSignUpButtonClick (email: string, password: string) {
    console.log('Login button Clicked');
    this.authService.signup(email, password)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .subscribe((res: HttpResponse<any>) => {
        console.log('res', res);
      })
  }
}
