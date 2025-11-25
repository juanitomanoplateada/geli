import { UserRecordResponse } from './../../../core/dto/user/record-user-response.dto';
import { UserService } from './../../../core/services/user/user.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  // Datos de perfil
  userProfile = {
    fullName: '',
    userId: '',
    institutionalEmail: '',
    userStatus: '',
    role: '',
    position: '',
  };

  // Campos cambio de contraseña
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // Visibilidad de inputs
  isCurrentPasswordVisible = false;
  isNewPasswordVisible = false;
  isConfirmPasswordVisible = false;

  // Estado validaciones
  invalidCurrentPassword = false;
  canShowNewPasswordFields = false;
  isNewPasswordValid = false;
  canSubmitPasswordChange = false;

  // Feedback al usuario
  feedbackMessage: string | null = null;
  isPasswordChangeSuccessful = false;
  isLoadingPasswordChange = false;

  isLoadingProfile = true;

  private debounceTimer: any;
  isValidatingCurrentPassword = false;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {}

  /** Traduce el rol interno a etiqueta en español */
  private translateRole(role: string): string {
    switch (role) {
      case 'QUALITY-ADMIN-USER':
        return 'ANALISTA DE CALIDAD';
      case 'AUTHORIZED-USER':
        return 'PERSONAL AUTORIZADO';
      // Añade más mapeos según tus roles
      default:
        return role;
    }
  }

  /** Alterna visibilidad de contraseña */
  toggleVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current')
      this.isCurrentPasswordVisible = !this.isCurrentPasswordVisible;
    if (field === 'new') this.isNewPasswordVisible = !this.isNewPasswordVisible;
    if (field === 'confirm')
      this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
  }

  /** Valida inputs de nueva contraseña y habilita el botón */
  onPasswordFieldsInput(): void {
    const fieldsFilled = !!this.newPassword && !!this.confirmPassword;
    this.isNewPasswordValid = this.validatePasswordPolicy(this.newPassword);
    this.canSubmitPasswordChange =
      fieldsFilled &&
      this.newPassword === this.confirmPassword &&
      this.isNewPasswordValid;
  }

  /** Regex de política de contraseña */
  private validatePasswordPolicy(password: string): boolean {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return pattern.test(password);
  }

  /** Envía el cambio de contraseña al backend */
  onSubmitPasswordChange(): void {}

  /** Limpia solo los campos de nueva contraseña */
  private resetNewPasswordFields(): void {
    this.newPassword = '';
    this.confirmPassword = '';
    this.isNewPasswordValid = false;
    this.canSubmitPasswordChange = false;
  }

  /** Limpia todos los campos de contraseña */
  private resetAllFields(): void {
    this.currentPassword = '';
    this.resetNewPasswordFields();
    this.canShowNewPasswordFields = false;
  }

  onCurrentPasswordInput(): void {}
}
