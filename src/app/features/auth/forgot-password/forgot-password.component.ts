import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { UppercaseNospaceDirective } from '../../../shared/uppercase-nospace.directive';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule, UppercaseNospaceDirective],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  username: string = '';
  feedbackMessage: string = '';
  isError: boolean = false;

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }

  login() {
    // Simula validación del usuario
    if (this.username.trim() === 'usuario.existente') {
      this.feedbackMessage =
        'Usuario encontrado. Se enviará un código al correo.';
      this.isError = false;
    } else {
      this.feedbackMessage =
        'Usuario no encontrado. Verifica y vuelve a intentar.';
      this.isError = true;
    }

    // Limpia el mensaje después de unos segundos
    setTimeout(() => {
      this.feedbackMessage = '';
    }, 5000);
  }
}
