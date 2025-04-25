import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewInit,
  QueryList,
  ViewChildren,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-confirm-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-code.component.html',
  styleUrls: ['./confirm-code.component.scss'],
})
export class ConfirmCodeComponent implements OnInit, OnDestroy, AfterViewInit {
  feedbackMessage: string = '';
  hasError: boolean = false;
  canResendCode: boolean = false;
  countdownSeconds: number = 45;
  showIncompleteTooltip: boolean = false;
  private countdownTimer: any;
  username: string = '';
  isResending: boolean = false;

  @ViewChildren('codeInput') inputBoxes!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  constructor(
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedToken = localStorage.getItem('temp_token');
      if (!storedToken) this.goBack(); // Seguridad por si accede sin pasar por forgot-password
      this.startCountdown();
    }
  }

  private setError(message: string): void {
    this.feedbackMessage = message;
    this.hasError = true;
  }

  verifyCode(code: string): void {
    const tempToken = localStorage.getItem('temp_token');
    if (!tempToken) {
      this.setError('❌ Token temporal no encontrado.');
      return;
    }

    this.authService.verifyRecoveryCode(tempToken, code).subscribe({
      next: (res) => {
        if (res.valid) {
          this.feedbackMessage = res.message || '✅ Código válido. Continúa.';
          this.hasError = false;

          localStorage.setItem('recovery_temp_token', res.tempToken); // este tempToken es nuevo y será usado en el reset

          setTimeout(() => {
            this.router.navigate(['/auth/change-password']);
          }, 2000);
        } else {
          this.setError(res.message || '❌ Código incorrecto.');
        }
      },
      error: () => {
        this.setError('❌ Error al verificar el código.');
      },
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inputBoxes.first?.nativeElement.focus(), 0);
  }

  ngOnDestroy(): void {
    this.clearCountdown();
  }

  goBack(): void {
    this.location.back();
  }

  onDigitInput(event: Event, index: number): void {
    const currentInput = event.target as HTMLInputElement;
    const digit = currentInput.value.replace(/\D/g, '');

    // Validación de campos previos vacíos
    for (let j = 0; j < index; j++) {
      if (!this.inputBoxes.get(j)?.nativeElement.value) {
        currentInput.value = '';
        this.inputBoxes.get(j)?.nativeElement.focus();
        return;
      }
    }

    // Asegurarse de que solo se ingrese un carácter
    if (digit.length > 1) {
      currentInput.value = digit.charAt(0);
    }

    if (digit) {
      currentInput.value = digit.charAt(0);
      if (index < 5) {
        this.inputBoxes.get(index + 1)?.nativeElement.focus();
      }
    } else {
      // Desplazar hacia la izquierda al borrar
      for (let i = index; i < this.inputBoxes.length - 1; i++) {
        const current = this.inputBoxes.get(i);
        const next = this.inputBoxes.get(i + 1);
        if (current && next) {
          const nextValue = next.nativeElement.value || '';
          current.nativeElement.value = nextValue;
        }
      }
      this.inputBoxes.last.nativeElement.value = '';
      this.inputBoxes.get(index)?.nativeElement.focus();
    }

    // Enviar automáticamente si hay 6 dígitos
    const code = this.getCompleteCode();
    if (code.length === 6) {
      this.verifyCode(code);
    }
  }

  onKeyNavigation(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;

    if (event.key === 'Backspace' && !input.value && index > 0) {
      event.preventDefault();
      setTimeout(
        () => this.inputBoxes.get(index - 1)?.nativeElement.focus(),
        0
      );
    }

    if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.inputBoxes.get(index - 1)?.nativeElement.focus();
    }

    if (event.key === 'ArrowRight' && index < this.inputBoxes.length - 1) {
      event.preventDefault();
      this.inputBoxes.get(index + 1)?.nativeElement.focus();
    }
  }

  onCodePaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedCode = event.clipboardData
      ?.getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (pastedCode) {
      this.inputBoxes.forEach((box, i) => {
        box.nativeElement.value = pastedCode.charAt(i) || '';
      });

      if (pastedCode.length === 6) {
        this.verifyCode(pastedCode);
      }
    }
  }

  getCompleteCode(): string {
    return this.inputBoxes.map((input) => input.nativeElement.value).join('');
  }

  resendVerificationCode(): void {
    if (!this.canResendCode) return;

    const tempToken = localStorage.getItem('temp_token');
    if (!tempToken) {
      this.setError(
        '❌ No se encontró el token temporal para reenviar el código.'
      );
      return;
    }

    this.isResending = true; // ⏳ Empieza la carga

    this.authService.resendRecoveryCode(tempToken).subscribe({
      next: (res) => {
        this.isResending = false; // ✅ Finaliza la carga

        if (res.codigoEnviado && res.tempToken) {
          localStorage.setItem('temp_token', res.tempToken); // actualiza
          this.feedbackMessage = res.message || '📩 Código reenviado';
          this.hasError = false;
          this.canResendCode = false;
          this.countdownSeconds = 45;
          this.startCountdown();
        } else {
          this.setError(res.message || 'No se pudo reenviar el código.');
        }
      },
      error: () => {
        this.isResending = false; // ⚠️ Finaliza también en caso de error
        this.setError('❌ Error al reenviar el código.');
      },
    });
  }

  private startCountdown(): void {
    this.clearCountdown();
    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      if (this.countdownSeconds <= 0) {
        this.canResendCode = true;
        this.clearCountdown();
      }
    }, 1000);
  }

  private clearCountdown(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
  }
}
