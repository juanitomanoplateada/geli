import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  isNewPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;
  feedbackMessage: string = '';
  isError: boolean = false;

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }

  togglePasswordVisibility(field: 'new' | 'confirm') {
    if (field === 'new') {
      this.isNewPasswordVisible = !this.isNewPasswordVisible;
    } else {
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
    }
  }

  validatePassword() {
    if (!this.newPassword || !this.confirmPassword) {
      this.feedbackMessage = '';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.feedbackMessage = 'Las contraseñas no coinciden';
      this.isError = true;
      return;
    }

    if (this.newPassword.length < 8) {
      this.feedbackMessage = 'La contraseña debe tener al menos 8 caracteres';
      this.isError = true;
      return;
    }

    const hasNumber = /\d/.test(this.newPassword);
    const hasUpper = /[A-Z]/.test(this.newPassword);
    const hasLower = /[a-z]/.test(this.newPassword);

    if (!hasNumber || !hasUpper || !hasLower) {
      this.feedbackMessage =
        'La contraseña debe contener mayúsculas, minúsculas y números';
      this.isError = true;
      return;
    }

    this.feedbackMessage = 'Contraseña válida y coincidente';
    this.isError = false;
  }

  get formValid(): boolean {
    return (
      this.newPassword.trim().length > 0 &&
      this.confirmPassword.trim().length > 0 &&
      !this.isError
    );
  }

  onChangePassword() {
    this.validatePassword();

    if (this.isError) return;

    console.log('Contraseña cambiada exitosamente');
  }
}
