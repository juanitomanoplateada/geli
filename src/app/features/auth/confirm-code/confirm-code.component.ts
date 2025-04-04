import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-confirm-code',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './confirm-code.component.html',
  styleUrl: './confirm-code.component.scss',
})
export class ConfirmCodeComponent implements OnInit, OnDestroy {
  code: string = '';
  canResend: boolean = false;
  countdown: number = 45;
  private interval: any;

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

  onCodeInput(event: any) {
    this.code = event.target.value.replace(/\s/g, '');
  }

  login() {
    console.log('Code:', this.code);
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
