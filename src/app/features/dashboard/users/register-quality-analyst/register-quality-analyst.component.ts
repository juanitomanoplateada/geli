import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// Components
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { DropdownSearchEntityComponent } from '../../../../shared/components/dropdown-search-entity/dropdown-search-entity.component';

// Directives
import { InputRulesDirective } from '../../../../shared/directives/input-rules/input-rules';

// Services
import { UserService } from '../../../../core/services/user/user.service';
import { PositionService } from './../../../../core/services/position/position.service';
import { PositionHelperService } from '../../../../core/services/position/position-helper.service';

// DTOs
import { PositionDto } from '../../../../core/dto/position/position-response.dto';
import { UserCreationDTO } from '../../../../core/dto/user/user-creation.dto';

@Component({
  selector: 'app-register-quality-analyst',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmModalComponent,
    DropdownSearchEntityComponent,
    InputRulesDirective,
  ],
  templateUrl: './register-quality-analyst.component.html',
  styleUrl: './register-quality-analyst.component.scss',
})
export class RegisterQualityAnalystComponent {
  // Properties
  availablePositionsList: {
    label: string;
    value: { id: number; positionName: string };
  }[] = [];

  selectedPosition: { id: number; positionName: string } | null = null;
  proposedPositionName: string | null = null;

  // Form state
  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    identification: ['', Validators.required],
    positionName: ['', Validators.required],
  });

  // UI state
  showConfirmationModal = false;
  feedbackMessage: string | null = null;
  feedbackSuccess = false;
  emailAlreadyExists = false;
  identificationAlreadyExists = false;

  isSubmitting = false;
  showModalFeedback = false;
  modalFeedbackMessage = '';
  modalFeedbackSuccess = false;

  modalSuccessType: 'success' | 'error' | '' = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private positionService: PositionService,
    private positionHelperService: PositionHelperService
  ) {}

  // Lifecycle hooks
  ngOnInit(): void {
    this.loadPositions();
  }

  // Public methods
  get institutionalEmail(): string {
    const prefix = this.userForm.get('email')?.value || '';
    return `${prefix}@uptc.edu.co`.toLowerCase();
  }

  submitForm(): void {
    if (this.isSubmitting) return;

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

    const positionName = this.userForm.value.positionName!.trim().toUpperCase();
    const existing = this.availablePositionsList.find(
      (opt) => opt.label.toUpperCase() === positionName
    );

    const payload: UserCreationDTO = {
      email: this.institutionalEmail.toUpperCase(),
      firstName: this.userForm.value.firstName!.trim(),
      lastName: this.userForm.value.lastName!.trim(),
      identification: this.userForm.value.identification!,
      role: 'QUALITY-ADMIN-USER',
      positionId: existing?.value.id || 0,
    };

    const createUser = () => {
      this.userService.createUser(payload).subscribe({
        next: () => {
          this.modalFeedback('✅ Usuario registrado exitosamente.', true);
          this.modalSuccessType = 'success';

          setTimeout(() => {
            this.resetForm();
            this.showConfirmationModal = false;
            this.isSubmitting = false;
            this.modalSuccessType = '';
            this.modalFeedbackMessage = '';
          }, 3000);
        },
        error: () => {
          this.modalFeedback('❌ Error al registrar usuario.', false);
          this.isSubmitting = false;
          this.modalSuccessType = 'error';

          setTimeout(() => {
            this.showConfirmationModal = false;
            this.isSubmitting = false;
            this.modalSuccessType = '';
            this.modalFeedbackMessage = '';
          }, 3000);
        },
      });
    };

    if (!existing) {
      this.positionService.create({ positionName }).subscribe({
        next: (newPosition) => {
          if (newPosition) {
            this.availablePositionsList.push({
              label: newPosition.positionName,
              value: {
                id: newPosition.id,
                positionName: newPosition.positionName,
              },
            });

            payload.positionId = newPosition.id;
            createUser();
          }
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

  resetForm(): void {
    this.userForm.reset({ positionName: '' });
    this.selectedPosition = null;
    this.proposedPositionName = null;
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

  onSelectPosition(position: { id: number; positionName: string }): void {
    this.selectedPosition = position;
    this.proposedPositionName = null;
    this.userForm.get('positionName')?.setValue(position.positionName);
  }

  onProposedPosition(name: string): void {
    this.proposedPositionName = name.trim().toUpperCase();
    this.selectedPosition = null;
    this.userForm.get('positionName')?.setValue(this.proposedPositionName);
  }

  get selectedPositionOrProposed(): PositionDto | null {
    if (this.selectedPosition) return this.selectedPosition;
    if (this.proposedPositionName)
      return { id: 0, positionName: this.proposedPositionName };
    return null;
  }

  // Private methods
  private loadPositions(): void {
    this.positionHelperService.getFormattedPositionOptions().subscribe({
      next: (options) => {
        this.availablePositionsList = options;
      },
    });
  }

  private showFeedback(msg: string, success: boolean): void {
    this.feedbackMessage = msg;
    this.feedbackSuccess = success;
    setTimeout(() => (this.feedbackMessage = null), 5000);
  }

  private modalFeedback(message: string, success: boolean): void {
    this.modalFeedbackMessage = message;
    this.modalFeedbackSuccess = success;
    this.showModalFeedback = true;
    setTimeout(() => {
      this.showModalFeedback = false;
    }, 5000);
  }

  checkIdentificationExists(): void {
    const identification = this.userForm.get('identification')?.value ?? '';
    this.userService.checkIdentificationExists(identification).subscribe({
      next: (exists) => (this.identificationAlreadyExists = exists),
      error: () => (this.identificationAlreadyExists = false),
    });
  }
}
