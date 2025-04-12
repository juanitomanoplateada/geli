import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  // Campos de contraseña
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Visibilidad de campos
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  // Estados de validación
  canSubmitPasswordChange = false;
  isNewPasswordValid = false;

  // Mensajes de respuesta
  feedbackMessage: string | null = null;
  passwordChangeSuccessful = false;

  // Datos del usuario
  userProfile = {
    fullName: 'RAMIREZ RAMIREZ RAMIREZ',
    userId: 'RAAA',
    institutionalEmail: 'RAAA',
    userStatus: 'Activo',
    role: 'Analista de Calidad',
  };

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm') {
    if (field === 'current')
      this.showCurrentPassword = !this.showCurrentPassword;
    if (field === 'new') this.showNewPassword = !this.showNewPassword;
    if (field === 'confirm')
      this.showConfirmPassword = !this.showConfirmPassword;
  }

  onCurrentPasswordInput() {
    this.validatePasswordForm();
  }

  validatePasswordForm() {
    const allFilled =
      this.currentPassword.trim().length > 0 &&
      this.newPassword.trim().length > 0 &&
      this.confirmPassword.trim().length > 0;

    const isMatch = this.newPassword === this.confirmPassword;

    this.isNewPasswordValid = this.validateSecurityPolicy(this.newPassword);
    this.canSubmitPasswordChange =
      allFilled && isMatch && this.isNewPasswordValid;
  }

  validateSecurityPolicy(password: string): boolean {
    const policy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return policy.test(password);
  }

  changePassword() {
    if (!this.canSubmitPasswordChange) return;

    const correctCurrentPassword = this.currentPassword === 'claveDeEjemplo';

    if (correctCurrentPassword) {
      this.feedbackMessage = 'Contraseña cambiada exitosamente.';
      this.passwordChangeSuccessful = true;
      this.resetForm();
    } else {
      this.feedbackMessage = 'La contraseña actual no es correcta.';
      this.passwordChangeSuccessful = false;
    }

    setTimeout(() => (this.feedbackMessage = null), 10000);
  }

  resetForm() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.canSubmitPasswordChange = false;
  }
}
