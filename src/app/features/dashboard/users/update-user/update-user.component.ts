import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { UppercaseNospaceDirective } from '../../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';
import { IntegerOnlyDirective } from '../../../../shared/directives/integer-only/integer-only.directive';
import { DropdownSearchAddableComponent } from '../../../../shared/components/dropdown-search-addable/dropdown-search-addable.component';

import {
  UserService,
  UserRecordResponse,
} from '../../../../core/user/services/user.service';
import {
  PositionService,
  PositionDto,
} from '../../../../core/position/services/position.service';

interface UpdateUserRequest {
  isActive: boolean;
  positionId?: number;
  positionName?: string;
}

@Component({
  selector: 'app-update-user',
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
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss'],
})
export class UpdateUserComponent implements OnInit {
  userId!: number;
  creationDate!: string;
  modificationDate!: string;

  readonly availableRoles = ['PERSONAL AUTORIZADO', 'ANALISTA DE CALIDAD'];
  readonly availableStatuses = ['ACTIVO', 'INACTIVO'];

  availablePositions: PositionDto[] = [];
  availableCargos: string[] = [];

  showConfirmationModal = false;
  feedbackMessage: string | null = null;
  feedbackSuccess = false;
  isSubmitting = false;

  userForm = this.fb.group({
    email: [
      { value: '', disabled: true },
      [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)],
    ],
    firstName: [{ value: '', disabled: true }, Validators.required],
    lastName: [{ value: '', disabled: true }, Validators.required],
    identification: [{ value: '', disabled: true }, Validators.required],
    role: [{ value: '', disabled: true }, Validators.required],
    cargo: ['', Validators.required],
    status: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private positionService: PositionService
  ) {}

  ngOnInit() {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    this.positionService.getAll().subscribe((positions) => {
      this.availablePositions = positions;
      this.availableCargos = positions.map((p) => p.name);
      this.loadUser();
    });
  }

  private loadUser() {
    this.userService.getUserById(this.userId).subscribe((user) => {
      this.creationDate = user.creationDate;
      this.modificationDate = user.modificationStatusDate;

      this.userForm.patchValue({
        email: this.extractPrefix(user.email),
        firstName: user.firstName,
        lastName: user.lastName,
        identification: user.identification,
        role: this.mapRoleToSpanish(user.role),
        cargo: user.position?.name ?? '',
        status: user.enabledStatus ? 'ACTIVO' : 'INACTIVO',
      });

      // Bloquear campos no editables
      ['email', 'firstName', 'lastName', 'identification', 'role'].forEach(
        (f) => this.userForm.get(f)?.disable()
      );
    });
  }

  get institutionalEmail(): string {
    const prefix = this.userForm.get('email')?.value || '';
    return `${prefix}@uptc.edu.co`.toLowerCase();
  }

  get cargoValue(): string | null {
    return this.userForm.get('cargo')?.value ?? null;
  }

  isAddingNewCargo = false;

  onSelectCargo(name: string) {
    const upper = name.trim().toUpperCase();
    const exists = this.availableCargos.some((c) => c.toUpperCase() === upper);
    this.isAddingNewCargo = !exists;

    // Si no existe, agregamos SOLO al array localmente (no en DB)
    if (!exists) {
      this.availableCargos.push(upper);
    }
    this.userForm.get('cargo')?.setValue(upper);
  }

  submitForm(): void {
    if (this.isSubmitting) return;
    this.transformValuesToUppercase();

    if (this.userForm.invalid) {
      this.showFeedback('Complete correctamente el formulario.', false);
      return;
    }
    this.showConfirmationModal = true;
  }

  get raw() {
    return this.userForm.getRawValue();
  }

  confirmUpdate(): void {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const isActive = this.userForm.get('status')?.value === 'ACTIVO';
    const selectedName = this.userForm.value.cargo!.trim().toUpperCase();
    const existing = this.availablePositions.find(
      (p) => p.name === selectedName
    );

    const payload: UpdateUserRequest = {
      isActive,
      ...(existing
        ? { positionId: existing.id }
        : { positionName: selectedName }),
    };

    this.userService.updateUser(this.userId, payload).subscribe({
      next: (updated) => {
        this.feedbackSuccess = true;
        this.feedbackMessage = '✅ Usuario actualizado exitosamente.';
        this.creationDate = updated.creationDate;
        this.modificationDate = updated.modificationStatusDate;

        setTimeout(() => {
          this.feedbackMessage = null;
          this.showConfirmationModal = false;
          this.isSubmitting = false;
          this.loadUser(); // refresca datos
        }, 4000); // ⏱ 4 segundos de feedback
      },
      error: () => {
        this.feedbackSuccess = false;
        this.feedbackMessage = '❌ Error al actualizar usuario.';
        setTimeout(() => {
          this.feedbackMessage = null;
          this.isSubmitting = false;
        }, 4000);
      },
    });
  }

  cancelConfirmation(): void {
    this.showConfirmationModal = false;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/users/search-user']);
  }

  private extractPrefix(email: string): string {
    return email.split('@')[0];
  }

  private mapRoleToSpanish(keycloakRole: string): string {
    const map: Record<string, string> = {
      'AUTHORIZED-USER': 'PERSONAL AUTORIZADO',
      'QUALITY-ADMIN-USER': 'ANALISTA DE CALIDAD',
    };
    return map[keycloakRole] ?? keycloakRole;
  }

  private transformValuesToUppercase(): void {
    [
      'email',
      'firstName',
      'lastName',
      'identification',
      'role',
      'cargo',
      'status',
    ].forEach((field) => {
      const ctl = this.userForm.get(field);
      if (ctl?.value) ctl.setValue(ctl.value.toString().toUpperCase());
    });
  }

  private showFeedback(message: string, success: boolean) {
    this.feedbackMessage = message;
    this.feedbackSuccess = success;
    setTimeout(() => (this.feedbackMessage = null), 5000);
  }
}
