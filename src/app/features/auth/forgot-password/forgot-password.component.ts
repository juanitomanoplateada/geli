import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UppercaseNospaceDirective } from '../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, UppercaseNospaceDirective],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  username: string = '';
  message: string = '';
  hasError: boolean = false;

  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    const cleanUsername = this.username.trim();

    if (cleanUsername === 'usuario.existente') {
      this.message = 'Usuario encontrado. Se enviará un código al correo.';
      this.hasError = false;
    } else {
      this.message = 'Usuario no encontrado. Verifica y vuelve a intentar.';
      this.hasError = true;
    }

    setTimeout(() => {
      this.message = '';
    }, 5000);
  }
}
