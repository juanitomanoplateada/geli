import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Location } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { UppercaseNospaceDirective } from '../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';

@Component({
  selector: 'app-confirm-code',
  standalone: true,
  imports: [CommonModule, FormsModule, UppercaseNospaceDirective],
  templateUrl: './confirm-code.component.html',
  styleUrls: ['./confirm-code.component.scss'],
})
export class ConfirmCodeComponent implements OnInit, OnDestroy {
  code: string = '';
  canResend: boolean = false;
  countdown: number = 45;
  message: string = '';
  hasError: boolean = false;

  private countdownInterval: any;

  constructor(
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.startCountdown();
    }
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  goBack(): void {
    this.location.back();
  }

  onSubmit(): void {
    const trimmedCode = this.code.trim();

    if (trimmedCode === '123456') {
      this.message = 'Código correcto. Puedes continuar.';
      this.hasError = false;
      // 🚀 Aquí podrías redirigir al siguiente paso
    } else {
      this.message = 'El código ingresado no es válido.';
      this.hasError = true;
    }

    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  resendCode(): void {
    if (!this.canResend) return;

    this.canResend = false;
    this.countdown = 45;
    this.startCountdown();
    console.log('📩 Código reenviado');
  }

  private startCountdown(): void {
    this.clearCountdown();

    this.countdownInterval = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        this.canResend = true;
        this.clearCountdown();
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
}
