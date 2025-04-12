import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { UppercaseDirective } from '../../../../shared/uppercase.directive';
import { UppercaseNospaceDirective } from '../../../../shared/uppercase-nospace.directive';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, UppercaseDirective, UppercaseNospaceDirective],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss'],
})
export class RegisterUserComponent {
  roles = ['Personal Autorizado', 'Analista de Calidad'];
  showDateField = signal(false);

  feedbackMessage: string | null = null;
  feedbackSuccess: boolean = false;

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
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

    const assignmentDateControl = this.registerForm.get('assignmentDate');

    if (role === 'Personal Autorizado') {
      assignmentDateControl?.setValidators([Validators.required]);
    } else {
      assignmentDateControl?.clearValidators();
      assignmentDateControl?.setValue('');
    }

    assignmentDateControl?.updateValueAndValidity();
  }

  onIdentificationInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\s/g, '');
    this.registerForm.patchValue({ identification: input.value });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const formData = {
        ...this.registerForm.value,
        email: this.fullEmail,
        fullName: `${this.registerForm.value.firstName} ${this.registerForm.value.lastName}`,
      };
      console.log('Formulario enviado:', formData);

      this.feedbackMessage = 'Persona registrada exitosamente.';
      this.feedbackSuccess = true;
      this.registerForm.reset();
      this.showDateField.set(false);
    } else {
      this.feedbackMessage = 'Por favor complete correctamente el formulario.';
      this.feedbackSuccess = false;
    }

    setTimeout(() => {
      this.feedbackMessage = null;
    }, 5000);
  }

  onCancel() {
    this.registerForm.reset();
    this.feedbackMessage = null;
    this.showDateField.set(false);
  }
}
