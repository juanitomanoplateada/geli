import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  isPasswordVisible: boolean = false;

  handleUsernameInput(event: any) {
    this.username = event.target.value.replace(/\s/g, '');
  }

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin() {
    console.log('Username:', this.username);
    console.log('Password:', this.password);
  }
}
