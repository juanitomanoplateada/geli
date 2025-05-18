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

    if (!cleanUsername || !this.password) {
      this.showError('Por favor ingrese usuario y contraseña');
      return;
    }

    this.isLoading = true;
    this.performLogin(cleanUsername);
  }

  private performLogin(username: string): void {
    this.authService.login(username, this.password).subscribe({
      next: (response) => this.handleLoginSuccess(response),
      error: (err) => this.handleLoginError(err),
    });
  }

  private handleLoginSuccess(response: any): void {
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
  }

  private handleLoginError(err: any): void {
    console.error('Login error:', err);

    try {
      // Intentar parsear el mensaje de error
      const errorMessage = err.error;
      let errorObj;

      // Verificar si el error es un string que contiene JSON
      if (typeof errorMessage === 'string') {
        // Extraer el JSON del mensaje de error
        const jsonMatch = errorMessage.match(/\{[^]*\}/);
        if (jsonMatch) {
          errorObj = JSON.parse(jsonMatch[0]);
        }
      } else {
        errorObj = errorMessage;
      }

      // Verificar si el error es porque la cuenta está desactivada
      if (
        errorObj?.error === 'invalid_grant' &&
        errorObj?.error_description === 'Account disabled'
      ) {
        this.showError(
          'Esta cuenta se encuentra desactivada. Por favor contacte al administrador.'
        );
      } else {
        this.showError('Usuario o contraseña incorrectos');
      }
    } catch (parseError) {
      console.error('Error al procesar el mensaje de error:', parseError);
      this.showError('Error al iniciar sesión. Por favor intente nuevamente.');
    }
  }

  private showError(message: string): void {
    this.message = message;
    this.hasError = true;
    this.isLoading = false;

    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
