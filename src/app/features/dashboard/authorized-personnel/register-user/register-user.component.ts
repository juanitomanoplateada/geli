import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss'],
})
export class RegisterUserComponent {
  roles = ['Personal Autorizado', 'Analista de Calidad'];
  showDateField = signal(false);

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    fullName: ['', Validators.required],
    identification: ['', Validators.required],
    role: ['', Validators.required],
    assignmentDate: [''],
  });

  constructor(private fb: FormBuilder) {}

  get fullEmail(): string {
    return `${this.registerForm.get('email')?.value}@uptc.edu.co`;
  }

  onRoleChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const role = selectElement.value;
    this.showDateField.set(role === 'Personal Autorizado');
    if (role !== 'Personal Autorizado') {
      this.registerForm.patchValue({ assignmentDate: '' });
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = {
        ...this.registerForm.value,
        email: this.fullEmail,
      };
      console.log('Formulario enviado:', formData);
      // Enviar formData al servidor
    }
  }

  onCancel() {
    this.registerForm.reset();
    this.showDateField.set(false);
  }
}
