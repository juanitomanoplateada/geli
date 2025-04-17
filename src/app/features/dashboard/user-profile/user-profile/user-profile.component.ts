import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent {
  userProfile = {
    fullName: 'RAMIREZ RAMIREZ RAMIREZ',
    userId: 'RAAA',
    institutionalEmail: 'RAAA@uptc.edu.co',
    userStatus: 'Activo',
    role: 'Analista de Calidad',
  };

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  isCurrentPasswordVisible = false;
  invalidCurrentPassword: boolean = false;

  isNewPasswordVisible = false;
  isConfirmPasswordVisible = false;

  isNewPasswordValid = false;
  canShowNewPasswordFields = false;
  canSubmitPasswordChange = false;

  feedbackMessage: string | null = null;
  isPasswordChangeSuccessful = false;

  toggleVisibility(field: 'current' | 'new' | 'confirm') {
    if (field === 'current')
      this.isCurrentPasswordVisible = !this.isCurrentPasswordVisible;
    if (field === 'new') this.isNewPasswordVisible = !this.isNewPasswordVisible;
    if (field === 'confirm')
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  onCurrentPasswordInput() {
    const correctPasswordMock = 'claveDeEjemplo';
    this.canShowNewPasswordFields =
      this.currentPassword === correctPasswordMock;

    this.invalidCurrentPassword =
      this.currentPassword.length > 0 && !this.canShowNewPasswordFields;

    if (!this.canShowNewPasswordFields) {
      this.resetNewPasswordFields();
    }
  }

  onPasswordFieldsInput() {
    const fieldsFilled = !!this.newPassword && !!this.confirmPassword;
    this.isNewPasswordValid = this.validatePasswordPolicy(this.newPassword);
    this.canSubmitPasswordChange =
      fieldsFilled &&
      this.newPassword === this.confirmPassword &&
      this.isNewPasswordValid;
  }

  validatePasswordPolicy(password: string): boolean {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return pattern.test(password);
  }

  onSubmitPasswordChange() {
    if (!this.canSubmitPasswordChange) return;

    this.feedbackMessage = 'Contraseña cambiada exitosamente.';
    this.isPasswordChangeSuccessful = true;
    this.resetAllFields();

    setTimeout(() => (this.feedbackMessage = null), 8000);
  }

  resetNewPasswordFields() {
    this.newPassword = '';
    this.confirmPassword = '';
    this.isNewPasswordValid = false;
    this.canSubmitPasswordChange = false;
  }

  resetAllFields() {
    this.currentPassword = '';
    this.resetNewPasswordFields();
    this.canShowNewPasswordFields = false;
  }
}
