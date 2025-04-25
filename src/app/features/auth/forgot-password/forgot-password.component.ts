import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UppercaseNospaceDirective } from '../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';
import { AuthService } from '../../../core/auth/services/auth.service';

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
  isLoading: boolean = false;
  cooldown = 0;
  cooldownInterval: any;

  constructor(
    private location: Location,
    private authService: AuthService,
    private router: Router
  ) {}

  goBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    const cleanUsername = this.username.trim();
    if (!cleanUsername) {
      this.setError('El nombre de usuario es obligatorio');
      return;
    }

    if (this.cooldown > 0 || this.isLoading) return;

    this.isLoading = true;
    this.message = '';
    this.hasError = false;

    this.authService.sendRecoveryCode(cleanUsername).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.usuarioEncontrado && res.codigoEnviado) {
          this.message = res.message || '✅ Código enviado al correo';
          this.hasError = false;

          // Guarda el token temporal en vez del username
          localStorage.setItem('temp_token', res.tempToken);
          this.startCooldown(45);

          setTimeout(() => {
            this.router.navigate(['/auth/confirm-code']);
          }, 2000);
        }
      },
    });
  }

  private setError(msg: string): void {
    this.message = msg;
    this.hasError = true;
  }

  private startCooldown(seconds: number): void {
    this.cooldown = seconds;
    this.cooldownInterval = setInterval(() => {
      this.cooldown--;
      if (this.cooldown <= 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }
}
