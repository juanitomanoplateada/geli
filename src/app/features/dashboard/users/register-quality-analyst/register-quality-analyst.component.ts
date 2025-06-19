import { Component } from '@angular/core';
import { PositionService } from './../../../../core/services/position/position.service';
import { PositionDto } from './../../../../core/dto/position/position-response.dto';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../../core/services/user/user.service';
import { CreateUserRequest } from '../../../../core/dto/user/create-user-request.dto';
import { DropdownSearchAddableComponent } from '../../../../shared/components/dropdown-search-addable/dropdown-search-addable.component';
import { UppercaseNospaceDirective } from '../../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { IntegerOnlyDirective } from '../../../../shared/directives/integer-only/integer-only.directive';
import { CommonModule } from '@angular/common';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';

@Component({
  selector: 'app-register-quality-analyst',
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
  templateUrl: './register-quality-analyst.component.html',
  styleUrl: './register-quality-analyst.component.scss',
})
export class RegisterQualityAnalystComponent {
  availablePositions: PositionDto[] = [];
  availablePositionNames: string[] = [];

  showConfirmationModal = false;
  feedbackMessage: string | null = null;
  feedbackSuccess = false;
  emailAlreadyExists = false;
  isSubmitting = false;

  showModalFeedback = false;
  modalFeedbackMessage = '';
  modalFeedbackSuccess = false;

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
    position: ['', Validators.required],
  });

  ngOnInit() {
    this.positionService.getAll().subscribe((list) => {
      if (Array.isArray(list)) {
        this.availablePositions = list;
        this.availablePositionNames = list.map((p) => p.name);
      } else {
        this.availablePositions = [];
        this.availablePositionNames = [];
      }
    });
  }

  get positionValue(): string | null {
    return this.userForm.get('position')?.value ?? null;
  }

  get institutionalEmail(): string {
    const prefix = this.userForm.get('email')?.value || '';
    return `${prefix}@uptc.edu.co`.toLowerCase();
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

    this.isSubmitting = true;

    const selectedName = this.userForm.value.position!.trim().toUpperCase();
    const existing = this.availablePositions.find(
      (p) => p.name === selectedName
    );

    const payload: CreateUserRequest = {
      email: this.institutionalEmail.toUpperCase(),
      firstName: this.userForm.value.firstName!.trim(),
      lastName: this.userForm.value.lastName!.trim(),
      identification: this.userForm.value.identification!,
      role: 'QUALITY-ADMIN-USER',
      positionId: existing?.id || 0,
    };

    const createUser = () => {
      this.userService.createUser(payload).subscribe({
        next: () => {
          this.modalFeedback('✅ Usuario registrado exitosamente.', true);
          setTimeout(() => {
            this.resetForm();
            this.showConfirmationModal = false;
            this.isSubmitting = false;
          }, 2000);
        },
        error: () => {
          this.modalFeedback('❌ Error al registrar usuario.', false);
          this.isSubmitting = false;
        },
      });
    };

    if (!existing) {
      this.positionService.create({ name: selectedName }).subscribe({
        next: (newPosition) => {
          this.availablePositions.push(newPosition);
          this.availablePositionNames.push(newPosition.name);
          payload.positionId = newPosition.id;
          createUser();
        },
        error: () => {
          this.modalFeedback('❌ Error al crear el cargo.', false);
          this.isSubmitting = false;
        },
      });
    } else {
      createUser();
    }
  }

  private modalFeedback(message: string, success: boolean) {
    this.modalFeedbackMessage = message;
    this.modalFeedbackSuccess = success;
    this.showModalFeedback = true;

    setTimeout(() => {
      this.showModalFeedback = false;
    }, 5000);
  }

  resetForm(): void {
    this.userForm.reset({ position: '' });
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
    ['email', 'firstName', 'lastName', 'identification', 'position'].forEach(
      (field) => {
        const ctl = this.userForm.get(field);
        if (ctl?.value) ctl.setValue(ctl.value.toString().toUpperCase());
      }
    );
  }

  private showFeedback(msg: string, success: boolean) {
    this.feedbackMessage = msg;
    this.feedbackSuccess = success;
    setTimeout(() => (this.feedbackMessage = null), 5000);
  }
}
