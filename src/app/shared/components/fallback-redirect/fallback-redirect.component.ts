import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserSessionService } from '../../../core/auth/services/user-session.service';

@Component({
  selector: 'app-fallback-redirect',
  standalone: true,
  template: `<p>Redirigiendo...</p>`,
})
export class FallbackRedirectComponent implements OnInit {
  private router = inject(Router);
  private session = inject(UserSessionService);

  ngOnInit() {
    if (this.session.isAuthenticated()) {
      this.router.navigate(['/dashboard/home']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
