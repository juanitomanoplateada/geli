import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appUppercase]',
  standalone: true,
})
export class UppercaseDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    const originalValue = input.value;
    const uppercasedValue = originalValue.toUpperCase();

    if (originalValue !== uppercasedValue) {
      input.value = uppercasedValue;

      // Mantener la posición del cursor
      if (start !== null && end !== null) {
        input.setSelectionRange(start, end);
      }

      // Disparar evento para actualizar el FormControl
      const newEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(newEvent);
    }
  }
}
