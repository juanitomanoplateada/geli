import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appUppercaseNospace]',
  standalone: true,
})
export class UppercaseNospaceDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = this.el.nativeElement;

    const start = input.selectionStart;
    const end = input.selectionEnd;

    const originalValue = input.value;

    // Transformar: a mayúsculas, sin espacios, solo alfanuméricos con tildes, - y .
    const transformedValue = originalValue
      .toUpperCase()
      .replace(/\s/g, '') // eliminar espacios
      .replace(/[^A-ZÁÉÍÓÚÜÑ0-9\-.]/g, '') // permitir letras tildadas, ñ, números, guion y punto
      .slice(0, 250); // limitar longitud

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
