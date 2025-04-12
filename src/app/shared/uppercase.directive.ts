import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appUppercase]',
  standalone: true,
})
export class UppercaseDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = this.el.nativeElement;
    const start = input.selectionStart;
    const end = input.selectionEnd;

    const upperValue = input.value.toUpperCase();
    input.value = upperValue;

    const eventInput = new Event('input', { bubbles: true });
    input.dispatchEvent(eventInput);

    if (start !== null && end !== null) {
      input.setSelectionRange(start, end);
    }
  }
}
