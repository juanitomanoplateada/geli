import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent {
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';

  isCurrentPasswordVisible: boolean = false;
  isNewPasswordVisible: boolean = false;
  isConfirmPasswordVisible: boolean = false;

  userProfile = {
    fullName: 'RAMIREZ RAMIREZ RAMIREZ',
    userId: 'RAAA',
    institutionalEmail: 'RAAA',
    userStatus: 'RAAA',
    role: 'RAAA',
  };

  togglePasswordVisibility(field: string) {
    switch (field) {
      case 'current':
        this.isCurrentPasswordVisible = !this.isCurrentPasswordVisible;
        break;
      case 'new':
        this.isNewPasswordVisible = !this.isNewPasswordVisible;
        break;
      case 'confirm':
        this.isConfirmPasswordVisible = !this.isConfirmPasswordVisible;
        break;
    }
  }

  changePassword() {
    // Add password change logic here
    if (this.newPassword !== this.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    // Here you would typically call a service to change the password
    console.log('Password change requested');
    console.log('Current:', this.currentPassword);
    console.log('New:', this.newPassword);

    // Reset the form
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';

    alert('Password changed successfully!');
  }
}
