import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  isNewPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  message: string = '';
  hasError: boolean = false;

  constructor(
    private location: Location,
    private router: Router,
    private authService: AuthService
  ) {}

  goBack(): void {
    this.location.back();
  }

  togglePasswordVisibility(field: 'new' | 'confirm'): void {
    if (field === 'new') {
      this.isNewPasswordVisible = !this.isNewPasswordVisible;
    } else {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
    }
  }

  validatePassword(): void {
    this.message = '';
    this.hasError = false;

    if (!this.newPassword || !this.confirmPassword) return;

    if (this.newPassword !== this.confirmPassword) {
      this.setError('Las contraseñas no coinciden');
      return;
    }

    if (this.newPassword.length < 8) {
      this.setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    const hasUpper = /[A-Z]/.test(this.newPassword);
    const hasLower = /[a-z]/.test(this.newPassword);
    const hasDigit = /\d/.test(this.newPassword);

    if (!hasUpper || !hasLower || !hasDigit) {
      this.setError(
        'La contraseña debe contener mayúsculas, minúsculas y números'
      );
      return;
    }

    this.message = 'Contraseña válida y coincidente';
    this.hasError = false;
  }

  get formValid(): boolean {
    return (
      this.newPassword.trim().length > 0 &&
      this.confirmPassword.trim().length > 0 &&
      !this.hasError
    );
  }

  onChangePassword(): void {
    this.validatePassword();

    if (this.hasError) return;

    const tempToken = localStorage.getItem('recovery_temp_token');
    if (!tempToken) {
      this.setError('❌ Token temporal no encontrado. Intenta de nuevo.');
      return;
    }

    this.authService
      .resetPasswordWithToken(tempToken, this.newPassword)
      .subscribe({
        next: (res) => {
          this.message = res.message || '✅ Contraseña cambiada exitosamente';
          this.hasError = false;

          // Limpieza total
          localStorage.removeItem('recovery_temp_token');
          localStorage.removeItem('recovery_username');
          localStorage.removeItem('access_token');

          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (err) => {
          this.setError('❌ Error al cambiar la contraseña');
          console.error(err);
        },
      });
  }

  private setError(msg: string): void {
    this.message = msg;
    this.hasError = true;
  }
}
