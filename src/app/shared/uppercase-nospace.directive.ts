import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appUppercaseNospace]',
  standalone: true,
})
export class UppercaseNospaceDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    // Convierte a mayúsculas y elimina espacios
    const processedValue = input.value.toUpperCase().replace(/\s/g, '');
    input.value = processedValue;

    const inputEvent = new Event('input', { bubbles: true });
    input.dispatchEvent(inputEvent);

    if (start !== null && end !== null) {
      input.setSelectionRange(start, end);
    }
  }
}
