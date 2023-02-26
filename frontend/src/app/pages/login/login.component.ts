import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  constructor (
    private authService: AuthService
  ) {}

  onLoginButtonClick (email: string, password: string) {
    console.log('Login button Clicked');
    this.authService.login(email, password)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .subscribe((res: HttpResponse<any>) => {
        console.log('res', res);
      })
  }

}
