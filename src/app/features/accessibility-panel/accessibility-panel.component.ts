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
  highContrast = false;
  highlightLinks = false;

  @HostBinding('style.fontSize.px') get fontSize() {
    return this.currentFontSize;
  }

  @HostBinding('class.high-contrast') get contrastClass() {
    return this.highContrast;
  }

  @HostBinding('class.highlight-links') get linksClass() {
    return this.highlightLinks;
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

  toggleContrast() {
    this.highContrast = !this.highContrast;
    this.applyToDocument('highContrast', this.highContrast.toString());
  }

  toggleHighlightLinks() {
    this.highlightLinks = !this.highlightLinks;
    this.applyToDocument('highlightLinks', this.highlightLinks.toString());
  }

  private applyToDocument(key: string, value: string) {
    document.documentElement.style.setProperty(`--accessibility-${key}`, value);
    document.body.classList.toggle(`accessibility-${key}`, value === 'true');
  }
}
