import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appInputRules]',
  standalone: true,
})
export class InputRulesDirective {
  @Input() uppercase = false;
  @Input() onlyLetters = false;
  @Input() onlyNumbers = false;
  @Input() onlyAlphanumeric = false;
  @Input() noSpaces = false;
  @Input() maxLength: number | null = null;
  @Input() alphanumericWithDash = false;

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput() {
    const input = this.el.nativeElement;
    let value = input.value;

    if (this.uppercase) value = value.toUpperCase();
    if (this.noSpaces) value = value.replace(/\s/g, '');
    if (this.onlyLetters) value = value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '');
    if (this.onlyNumbers) value = value.replace(/[^0-9]/g, '');
    if (this.onlyAlphanumeric) value = value.replace(/[^A-Za-z0-9]/g, '');
    if (this.maxLength !== null) value = value.slice(0, this.maxLength);
    if (this.alphanumericWithDash) {
      value = value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9-]/g, '');
    }

    if (input.value !== value) {
      const start = input.selectionStart;
      const end = input.selectionEnd;

      input.value = value;

      if (start !== null && end !== null) {
        input.setSelectionRange(start, end);
      }

      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}
