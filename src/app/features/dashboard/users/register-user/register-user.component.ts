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
import { UppercaseDirective } from '../../../../shared/uppercase/uppercase.directive';
import { UppercaseNospaceDirective } from '../../../../shared/uppercase-nospace/uppercase-nospace.directive';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UppercaseDirective,
    UppercaseNospaceDirective,
  ],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss'],
})
export class RegisterUserComponent {
  // Roles disponibles
  availableRoles = ['Personal Autorizado', 'Analista de Calidad'];

  // Estado visual
  showAssignmentDateField = signal(false);
  showConfirmationModal = false;

  // Retroalimentación
  feedbackMessage: string | null = null;
  feedbackSuccess = false;
  emailAlreadyExists = false;

  // Correos simulados ya registrados
  existingInstitutionalEmails = [
    'juan.perez@uptc.edu.co',
    'ana.gomez@uptc.edu.co',
  ];

  constructor(private formBuilder: FormBuilder) {}

  // Getter para correo institucional completo
  get institutionalEmail(): string {
    return `${this.userForm.get('email')?.value}@uptc.edu.co`.toLowerCase();
  }

  // Getter para hoy en formato yyyy-MM-dd
  get todayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Validador: fecha debe ser hoy o futura
  validateFutureOrTodayDate = (
    control: AbstractControl
  ): ValidationErrors | null => {
    if (!control.value) return null;

    const inputDate = control.value; // 'YYYY-MM-DD'
    const today = this.todayDate;

    return inputDate < today ? { pastDate: true } : null;
  };

  // Formulario reactivo
  userForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    identification: ['', Validators.required],
    role: ['', Validators.required],
    assignmentDate: [''], // sin validadores aquí, se agregan dinámicamente
  });

  // Evento cambio de rol
  handleRoleChange(event: Event): void {
    const selectedRole = (event.target as HTMLSelectElement).value;
    const assignmentDateControl = this.userForm.get('assignmentDate');
    const isAuthorized = selectedRole === 'Personal Autorizado';

    this.showAssignmentDateField.set(isAuthorized);

    if (isAuthorized) {
      assignmentDateControl?.setValidators([
        Validators.required,
        this.validateFutureOrTodayDate,
      ]);
    } else {
      assignmentDateControl?.clearValidators();
      assignmentDateControl?.setValue('');
    }

    assignmentDateControl?.updateValueAndValidity();
  }

  // Verificar correo duplicado
  checkEmailExists(): void {
    this.emailAlreadyExists = this.existingInstitutionalEmails.includes(
      this.institutionalEmail
    );
  }

  // Intentar registrar
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

  // Confirmar desde modal
  confirmRegistration(): void {
    const userData = {
      ...this.userForm.value,
      email: this.institutionalEmail,
      fullName: `${this.userForm.value.firstName} ${this.userForm.value.lastName}`,
    };

    console.log('Formulario enviado:', userData);

    this.feedbackMessage = 'Persona registrada exitosamente.';
    this.feedbackSuccess = true;

    this.userForm.reset();
    this.emailAlreadyExists = false;
    this.showAssignmentDateField.set(false);
    this.showConfirmationModal = false;

    setTimeout(() => (this.feedbackMessage = null), 5000);
  }

  // Cancelar modal
  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  // Cancelar formulario
  resetForm(): void {
    this.userForm.reset();
    this.feedbackMessage = null;
    this.emailAlreadyExists = false;
    this.showAssignmentDateField.set(false);
  }
}
