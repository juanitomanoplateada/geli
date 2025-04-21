import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { UppercaseNospaceDirective } from '../../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmModalComponent,
    UppercaseDirective,
    UppercaseNospaceDirective,
  ],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss'],
})
export class RegisterUserComponent {
  // Roles disponibles para selección
  readonly availableRoles = ['Personal Autorizado', 'Analista de Calidad'];

  // Estados visuales y de control
  showAssignmentDateField = signal(false);
  showConfirmationModal = false;
  feedbackMessage: string | null = null;
  feedbackSuccess = false;
  emailAlreadyExists = false;

  // Correos ya existentes simulados
  readonly registeredEmails = [
    'juan.perez@uptc.edu.co',
    'ana.gomez@uptc.edu.co',
  ];

  constructor(private formBuilder: FormBuilder) {}

  // Getters computados
  get institutionalEmail(): string {
    const emailPrefix = this.userForm.get('email')?.value || '';
    return `${emailPrefix}@uptc.edu.co`.toLowerCase();
  }

  get todayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // Validador personalizado para fechas no pasadas
  validateNotPastDate = (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return control.value < this.todayDate ? { pastDate: true } : null;
  };

  // Formulario reactivo de usuario
  userForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    identification: ['', Validators.required],
    role: ['', Validators.required],
    assignmentDate: [''], // Validador se asigna dinámicamente
  });

  // Evento al cambiar el rol
  handleRoleChange(event: Event): void {
    const selectedRole = (event.target as HTMLSelectElement).value;
    const requiresAssignmentDate = selectedRole === 'Personal Autorizado';

    this.showAssignmentDateField.set(requiresAssignmentDate);

    const assignmentDateCtrl = this.userForm.get('assignmentDate');
    if (requiresAssignmentDate) {
      assignmentDateCtrl?.setValidators([
        Validators.required,
        this.validateNotPastDate,
      ]);
    } else {
      assignmentDateCtrl?.clearValidators();
      assignmentDateCtrl?.setValue('');
    }
    assignmentDateCtrl?.updateValueAndValidity();
  }

  // Verificación si ya existe el correo
  checkEmailExists(): void {
    this.emailAlreadyExists = this.registeredEmails.includes(
      this.institutionalEmail
    );
  }

  // Envío del formulario
  submitForm(): void {
    this.checkEmailExists();

    if (this.emailAlreadyExists) {
      this.feedbackMessage = 'Este correo institucional ya está registrado.';
      this.feedbackSuccess = false;
      return;
    }

    if (this.userForm.valid) {
      this.showConfirmationModal = true;
    } else {
      this.feedbackMessage = 'Por favor complete correctamente el formulario.';
      this.feedbackSuccess = false;
      setTimeout(() => (this.feedbackMessage = null), 5000);
    }
  }

  // Confirmación desde modal
  confirmRegistration(): void {
    const userData = {
      ...this.userForm.value,
      email: this.institutionalEmail,
      fullName: `${this.userForm.value.firstName} ${this.userForm.value.lastName}`,
    };

    console.log('Registro exitoso:', userData);

    this.feedbackMessage = 'Persona registrada exitosamente.';
    this.feedbackSuccess = true;
    this.showConfirmationModal = false;
    this.userForm.reset();
    this.emailAlreadyExists = false;
    this.showAssignmentDateField.set(false);

    setTimeout(() => (this.feedbackMessage = null), 5000);
  }

  // Cancelar modal
  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  // Cancelar todo el formulario
  resetForm(): void {
    this.userForm.reset();
    this.feedbackMessage = null;
    this.emailAlreadyExists = false;
    this.showAssignmentDateField.set(false);
  }
}
