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
  focusEnabled = false;

  @HostBinding('style.fontSize.px') get fontSize() {
    return this.currentFontSize;
  }

  togglePanel() {
    this.isExpanded = !this.isExpanded;
  }

  toggleFocusMode() {
    this.focusEnabled = !this.focusEnabled;

    if (this.focusEnabled) {
      document.body.classList.add('focus-visible-enabled');
    } else {
      document.body.classList.remove('focus-visible-enabled');
    }
  }

  increaseFont() {
    if (this.currentFontSize < 24) {
    this.currentFontSize += 2;
    this.applyToDocument('fontSize', `${this.currentFontSize}px`);
    }
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
  }
}
