import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccessibilityPanelComponent } from './features/accessibility-panel/accessibility-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AccessibilityPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'incitema';
}
