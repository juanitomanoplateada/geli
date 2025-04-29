import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/services/auth.service';
import { decodeToken } from '../../../core/auth/services/token.utils';
import { UppercaseNospaceDirective } from '../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, UppercaseNospaceDirective],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  isPasswordVisible: boolean = false;

  message: string = '';
  hasError: boolean = false;

  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin(): void {
    const cleanUsername = this.username.trim().toLowerCase();

    this.isLoading = true;
    this.authService.login(cleanUsername, this.password).subscribe({
      next: (response) => {
        const token = response.access_token;
        const decoded = decodeToken(token);

        const user = decoded?.preferred_username || '';
        const roles = decoded?.realm_access?.roles || [];

        localStorage.setItem('auth_token', token);
        localStorage.setItem('username', user);
        localStorage.setItem('roles', JSON.stringify(roles));
        localStorage.setItem('is_authenticated', 'true');

        this.message = 'Inicio de sesión exitoso';
        this.hasError = false;

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
          this.isLoading = false;
        }, 1000);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.message = 'Usuario o contraseña incorrectos';
        this.hasError = true;
        this.isLoading = false;

        setTimeout(() => {
          this.message = '';
        }, 5000);
      },
    });
  }
}
