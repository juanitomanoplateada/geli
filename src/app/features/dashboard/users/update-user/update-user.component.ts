import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UppercaseDirective } from '../../../../shared/directives/uppercase/uppercase.directive';
import { UppercaseNospaceDirective } from '../../../../shared/directives/uppercase-nospace/uppercase-nospace.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-update-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UppercaseDirective,
    UppercaseNospaceDirective,
  ],
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.scss'],
})
export class UpdateUserComponent {
  roles = ['Personal Autorizado', 'Analista de Calidad'];
  showDateField = signal(false);

  feedbackMessage: string | null = null;
  feedbackSuccess: boolean = false;

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    identification: ['', Validators.required],
    role: ['', Validators.required],
    assignmentDate: [''],
    status: ['activo', Validators.required],
  });

  // Simulación de BD
  private fakeUserDB: any = {
    '1': {
      email: 'maria.lopez',
      fullName: 'MARIA LOPEZ',
      identification: '1122334455',
      role: 'Personal Autorizado',
      assignmentDate: '2024-03-15',
      status: 'activo',
    },
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    const userData = this.fakeUserDB[id ?? ''];
    if (userData) {
      this.setUserData(userData);
    }
  }

  get fullEmail(): string {
    return `${this.userForm.get('email')?.value}@uptc.edu.co`;
  }

  onRoleChange(event: Event) {
    const role = (event.target as HTMLSelectElement).value;
    const assignmentDateControl = this.userForm.get('assignmentDate');

    this.showDateField.set(role === 'Personal Autorizado');
    if (role === 'Personal Autorizado') {
      assignmentDateControl?.setValidators([Validators.required]);
    } else {
      assignmentDateControl?.clearValidators();
      assignmentDateControl?.setValue('');
    }
    assignmentDateControl?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.userForm.valid) {
      const formData = {
        ...this.userForm.value,
        email: this.fullEmail,
        fullName: `${this.userForm.value.firstName} ${this.userForm.value.lastName}`,
      };

      console.log('Actualización enviada:', formData);
      this.feedbackMessage = 'Datos actualizados correctamente.';
      this.feedbackSuccess = true;
    } else {
      this.feedbackMessage = 'Por favor revise los campos requeridos.';
      this.feedbackSuccess = false;
    }

    setTimeout(() => (this.feedbackMessage = null), 5000);
  }

  setUserData(user: any) {
    const [firstName, ...lastParts] = user.fullName.split(' ');
    const lastName = lastParts.join(' ');

    const [username] = user.email.split('@');
    this.userForm.patchValue({
      email: username,
      firstName,
      lastName,
      identification: user.identification,
      role: user.role,
      assignmentDate: user.assignmentDate,
      status: user.status,
    });

    this.showDateField.set(user.role === 'Personal Autorizado');
  }

  onCancel() {
    this.userForm.reset();
    this.feedbackMessage = null;
    this.showDateField.set(false);
    this.router.navigate(['../search-user']);
  }
}
