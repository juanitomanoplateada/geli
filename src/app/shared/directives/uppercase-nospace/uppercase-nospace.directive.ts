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
    const transformedValue = originalValue.toUpperCase().replace(/\s/g, '');

    if (originalValue !== transformedValue) {
      input.value = transformedValue;

      if (start !== null && end !== null) {
        input.setSelectionRange(start, end);
      }

      // Disparar evento para actualizar el FormControl
      const newEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(newEvent);
    }
  }
}
