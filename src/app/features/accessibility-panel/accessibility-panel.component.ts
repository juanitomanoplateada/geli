import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-accessibility-panel',
  templateUrl: './accessibility-panel.component.html',
  styleUrls: ['./accessibility-panel.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class AccessibilityPanelComponent {
  isExpanded = false;
  currentFontSize = 16;

  @HostBinding('style.fontSize.px') get fontSize() {
    return this.currentFontSize;
  }

  togglePanel() {
    this.isExpanded = !this.isExpanded;
  }

  increaseFont() {
    this.currentFontSize += 2;
    this.applyToDocument('fontSize', `${this.currentFontSize}px`);
  }

  decreaseFont() {
    if (this.currentFontSize > 12) {
      this.currentFontSize -= 2;
      this.applyToDocument('fontSize', `${this.currentFontSize}px`);
    }
  }

  resetFont() {
    this.currentFontSize = 16;
    this.applyToDocument('fontSize', `${this.currentFontSize}px`);
  }

  private applyToDocument(key: string, value: string) {
    document.documentElement.style.setProperty(`--accessibility-${key}`, value);
    document.body.classList.toggle(`accessibility-${key}`, value === 'true');
  }
}
