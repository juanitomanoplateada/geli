import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UppercaseNospaceDirective } from '../../../shared/uppercase-nospace.directive';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule, UppercaseNospaceDirective],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  isPasswordVisible: boolean = false;
  loginMessage: string = '';
  loginError: boolean = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onLogin() {
    // Simulación de autenticación (deberías reemplazar esto con un servicio real)
    if (this.username === 'ADMIN' && this.password === '1234') {
      this.loginMessage = 'Inicio de sesión exitoso';
      this.loginError = false;
      // Redirigir o continuar flujo
    } else {
      this.loginMessage = 'Usuario o contraseña incorrectos';
      this.loginError = true;
    }

    // Opcional: borrar el mensaje luego de unos segundos
    setTimeout(() => {
      this.loginMessage = '';
    }, 5000);
  }
}
