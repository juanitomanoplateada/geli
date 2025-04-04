import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  username: string = '';

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }

  onUsernameInput(event: any) {
    this.username = event.target.value.replace(/\s/g, '');
  }

  login() {
    console.log('Username:', this.username);
  }
}
