import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appIntegerOnly]',
  standalone: true,
})
export class IntegerOnlyDirective {
  private maxLength = 10; // Cambia este valor al límite que desees

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
    ];

    const isNumber = /^[0-9]$/.test(event.key);
    const currentValue = this.el.nativeElement.value;

    // Permitir teclas de control o navegación
    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Impedir si no es número
    if (!isNumber) {
      event.preventDefault();
      return;
    }

    // Impedir si ya se alcanzó el máximo de dígitos
    if (currentValue.length >= this.maxLength) {
      event.preventDefault();
    }
  }
}
