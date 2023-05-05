import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

  public key: string;

  constructor (
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.key = this.route.snapshot.queryParams['key'];
  }

  public onResetPasswordClick(email: string) {
    try {
      if (email === '' || typeof email === 'undefined') {
        throw new Error('Email cannot be empty or undefined.');
      }
      this.authService.forgotPassword(email);
    } catch (error) {
        console.error('ForgotPasswordComponent: ', error)
      }
    }

  public onSubmitClick(key: string, password: string, confirmPassword: string) {
    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      if (password === '' || typeof password === 'undefined') {
        throw new Error('Password cannot be empty or undefined.');
      }
      if (confirmPassword === '' || typeof confirmPassword === 'undefined') {
        throw new Error('Confirm Password cannot be empty or undefined.');
      }

      this.authService.resetPassword(key, password, confirmPassword)
    } catch (error) {
      console.error('ForgotPasswordComponent: ', error)
    }
  }
  }
