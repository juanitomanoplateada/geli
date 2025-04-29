import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { UppercaseNospaceDirective } from '../../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';
import { IntegerOnlyDirective } from '../../../../shared/directives/integer-only/integer-only.directive';
import { DropdownSearchAddableComponent } from '../../../../shared/components/dropdown-search-addable/dropdown-search-addable.component';
import {
  UserService,
  CreateUserRequest,
} from '../../../../core/user/services/user.service';
import {
  PositionService,
  PositionDto,
} from '../../../../core/position/services/position.service';

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
    IntegerOnlyDirective,
    DropdownSearchAddableComponent,
  ],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.scss'],
})
export class RegisterUserComponent implements OnInit {
  readonly availableRoles = ['PERSONAL AUTORIZADO', 'ANALISTA DE CALIDAD'];

  availablePositions: PositionDto[] = [];
  availableCargos: string[] = [];

  showConfirmationModal = false;
  feedbackMessage: string | null = null;
  feedbackSuccess = false;
  emailAlreadyExists = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private positionService: PositionService
  ) {}

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    identification: ['', Validators.required],
    role: ['', Validators.required],
    cargo: ['', Validators.required],
  });

  ngOnInit() {
    // Load positions from server
    this.positionService.getAll().subscribe((list) => {
      this.availablePositions = list;
      this.availableCargos = list.map((p) => p.name);
    });
  }

  get cargoValue(): string | null {
    return this.userForm.get('cargo')?.value ?? null;
  }

  get institutionalEmail(): string {
    const prefix = this.userForm.get('email')?.value || '';
    return `${prefix}@uptc.edu.co`.toLowerCase();
  }

  onCreateCargo(name: string) {
    const upper = name.trim().toUpperCase();
    this.positionService.create({ name: upper }).subscribe((dto) => {
      this.availablePositions.push(dto);
      this.availableCargos.push(dto.name);
      this.userForm.get('cargo')?.setValue(dto.name);
    });
  }

  submitForm(): void {
    if (this.isSubmitting) return;
    this.transformFormValuesToUppercase();

    const prefix = this.userForm.get('email')?.value || '';
    if (!prefix) {
      return this.showFeedback('Debe ingresar un correo.', false);
    }

    const email = this.institutionalEmail;
    this.isSubmitting = true;
    this.userService.checkEmailExists(email).subscribe({
      next: (exists) => {
        this.emailAlreadyExists = exists;
        if (exists) {
          this.showFeedback('Este correo ya está registrado.', false);
        } else if (this.userForm.valid) {
          this.showConfirmationModal = true;
        } else {
          this.showFeedback('Complete correctamente el formulario.', false);
        }
        this.isSubmitting = false;
      },
      error: () => {
        this.showFeedback('Error validando el correo.', false);
        this.isSubmitting = false;
      },
    });
  }

  confirmRegistration(): void {
    if (this.isSubmitting) return;

    // map your Spanish role to Keycloak role
    const roleMap: Record<string, string> = {
      'PERSONAL AUTORIZADO': 'AUTHORIZED-USER',
      'ANALISTA DE CALIDAD': 'QUALITY-ADMIN-USER',
    };
    const mappedRole = roleMap[this.userForm.value.role!];

    // determine whether the user picked an existing position or typed a new one
    const selectedName = this.userForm.value.cargo!.trim().toUpperCase();
    const existing = this.availablePositions.find(
      (p) => p.name === selectedName
    );

    // build the payload with the right field
    const payload: any = {
      email: this.institutionalEmail.toUpperCase(),
      firstName: this.userForm.value.firstName!,
      lastName: this.userForm.value.lastName!,
      identification: this.userForm.value.identification!,
      role: mappedRole,
    };

    if (existing) {
      // ✔ existing position
      payload.positionId = existing.id;
    } else {
      // ➕ new position
      payload.positionName = selectedName;
    }

    // send
    this.isSubmitting = true;
    this.userService.createUser(payload).subscribe({
      next: () => {
        this.showFeedback('✅ Persona registrada exitosamente.', true);
        this.resetForm();
        this.isSubmitting = false;
      },
      error: () => {
        this.showFeedback('❌ Error al registrar usuario.', false);
        this.isSubmitting = false;
      },
    });
  }

  resetForm(): void {
    this.userForm.reset({ role: '', cargo: '' });
    this.feedbackMessage = null;
    this.emailAlreadyExists = false;
    this.showConfirmationModal = false;
    this.isSubmitting = false;
  }

  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  checkEmailExists(): void {
    const prefix = this.userForm.get('email')?.value || '';
    if (!prefix) {
      this.emailAlreadyExists = false;
      return;
    }
    const email = this.institutionalEmail;
    this.userService.checkEmailExists(email).subscribe({
      next: (exists) => (this.emailAlreadyExists = exists),
      error: () => (this.emailAlreadyExists = false),
    });
  }

  private transformFormValuesToUppercase(): void {
    [
      'email',
      'firstName',
      'lastName',
      'identification',
      'role',
      'cargo',
    ].forEach((field) => {
      const ctl = this.userForm.get(field);
      if (ctl?.value) ctl.setValue(ctl.value.toString().toUpperCase());
    });
  }

  private showFeedback(msg: string, success: boolean) {
    this.feedbackMessage = msg;
    this.feedbackSuccess = success;
    setTimeout(() => (this.feedbackMessage = null), 5000);
  }
}
