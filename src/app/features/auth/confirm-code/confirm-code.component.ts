import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { UppercaseNospaceDirective } from '../../../shared/uppercase-nospace/uppercase-nospace.directive';

@Component({
  selector: 'app-confirm-code',
  standalone: true,
  imports: [FormsModule, CommonModule, UppercaseNospaceDirective],
  templateUrl: './confirm-code.component.html',
  styleUrl: './confirm-code.component.scss',
})
export class ConfirmCodeComponent implements OnInit, OnDestroy {
  code: string = '';
  canResend: boolean = false;
  countdown: number = 45;
  private interval: any;
  feedbackMessage: string = '';
  isError: boolean = false;

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

  goBack() {
    this.location.back();
  }

  login() {
    if (this.code.trim() === '123456') {
      this.feedbackMessage = 'Código correcto. Puedes continuar.';
      this.isError = false;
      // Aquí podrías redirigir o avanzar al siguiente paso
    } else {
      this.feedbackMessage = 'El código ingresado no es válido.';
      this.isError = true;
    }

    setTimeout(() => {
      this.feedbackMessage = '';
    }, 5000);
  }

  resendCode() {
    if (!this.canResend) return;

    this.canResend = false;
    this.countdown = 45;
    this.startCountdown();
    console.log('Código reenviado');
  }

  private startCountdown() {
    this.clearCountdown();

    this.interval = setInterval(() => {
      this.countdown--;

      if (this.countdown <= 0) {
        this.canResend = true;
        this.clearCountdown();
      }
    }, 1000);
  }

  private clearCountdown() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}
