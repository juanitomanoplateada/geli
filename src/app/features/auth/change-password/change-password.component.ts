import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  isNewPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

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

  onChangePassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (this.newPassword.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    const hasNumber = /\d/.test(this.newPassword);
    const hasUpper = /[A-Z]/.test(this.newPassword);
    const hasLower = /[a-z]/.test(this.newPassword);

    if (!hasNumber || !hasUpper || !hasLower) {
      alert('La contraseña debe contener mayúsculas, minúsculas y números');
      return;
    }

    console.log('Contraseña cambiada exitosamente');
  }
}
