import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-fallback-redirect',
  standalone: true,
  template: `<p>Redirigiendo...</p>`,
})
export class FallbackRedirectComponent {
  constructor(private router: Router) {
    this.router.navigate(['/dashboard/home']);
  }
}
