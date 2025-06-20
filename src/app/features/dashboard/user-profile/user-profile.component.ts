import { UserRecordResponse } from './../../../core/dto/user/record-user-response.dto';
import { UserService } from './../../../core/services/user/user.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

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

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const email = this.authService.getCurrentUserEmail();

    this.userService.getUserByEmail(email).subscribe({
      next: (user: UserRecordResponse) => {
        this.userProfile = {
          fullName: `${user.firstName} ${user.lastName}`,
          userId: user.identification.toString(),
          institutionalEmail: user.email,
          userStatus: user.enabledStatus ? 'Activo' : 'Inactivo',
          role: this.translateRole(user.role),
          position: user.position?.positionName ?? 'Sin posición',
        };
        this.isLoadingProfile = false;
      },
      error: () => {
        this.isLoadingProfile = false;
        // Aquí podrías redirigir al login si lo deseas
      },
    });
  }

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
  onSubmitPasswordChange(): void {
    if (!this.canSubmitPasswordChange) return;

    this.isLoadingPasswordChange = true;
    this.feedbackMessage = null;

    this.authService.changePassword(this.newPassword).subscribe({
      next: (res) => {
        this.isLoadingPasswordChange = false;
        this.feedbackMessage =
          res.message || 'Contraseña cambiada exitosamente.';
        this.isPasswordChangeSuccessful = res.success ?? true;
        this.resetAllFields();

        // Cierra sesión tras mostrar feedback
        setTimeout(() => {
          this.feedbackMessage = null;
          localStorage.clear();
          this.router.navigate(['/auth/login']);
        }, 4000);
      },
      error: () => {
        this.isLoadingPasswordChange = false;
        this.feedbackMessage = '❌ Error al cambiar la contraseña.';
        this.isPasswordChangeSuccessful = false;
        setTimeout(() => (this.feedbackMessage = null), 8000);
      },
    });
  }

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

  onCurrentPasswordInput(): void {
    clearTimeout(this.debounceTimer);

    if (!this.currentPassword) {
      this.canShowNewPasswordFields = false;
      this.invalidCurrentPassword = false;
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.isValidatingCurrentPassword = true;

      this.authService.validateCurrentPassword(this.currentPassword).subscribe({
        next: () => {
          this.isValidatingCurrentPassword = false;
          this.canShowNewPasswordFields = true;
          this.invalidCurrentPassword = false;
        },
        error: () => {
          this.isValidatingCurrentPassword = false;
          this.canShowNewPasswordFields = false;
          this.invalidCurrentPassword = true;
          this.resetNewPasswordFields();
        },
      });
    }, 500); // debounce de 500ms
  }
}
