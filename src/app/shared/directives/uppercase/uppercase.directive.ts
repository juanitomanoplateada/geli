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

    // Transformar: a mayúsculas, permitir alfanuméricos con tildes, espacios, guiones y puntos
    const transformedValue = originalValue
      .toUpperCase()
      .replace(/[^A-ZÁÉÍÓÚÜÑ0-9\-\. ]/g, '') // incluir espacio también
      .slice(0, 250); // limitar a 250 caracteres

    if (originalValue !== transformedValue) {
      input.value = transformedValue;

      if (start !== null && end !== null) {
        input.setSelectionRange(start, end);
      }

      const newEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(newEvent);
    }
  }
}
