import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrestamistaUpdateDTO } from '../auth/models/auth.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  
  isEditing = false;
  profileForm!: FormGroup;
  message = '';
  error = '';

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    const user = this.authService.currentUser();
    this.profileForm = this.fb.group({
      nombre: [user?.nombre || '', Validators.required],
      apellido: [user?.apellido || '', Validators.required],
      email: [user?.correo || '', [Validators.required, Validators.email]],
      usuario: [user?.usuario || '', Validators.required],
      contraseniaActual: [''],
      nuevaContrasenia: ['']
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.initForm(); // Reset form to current values
      this.message = '';
      this.error = '';
    }
  }

  onSubmit() {
    if (this.profileForm.valid) {
      const formValue = this.profileForm.value;
      const updateDto: PrestamistaUpdateDTO = {
        nombre: formValue.nombre,
        apellido: formValue.apellido,
        email: formValue.email,
        usuario: formValue.usuario,
        contraseniaActual: formValue.contraseniaActual || undefined,
        nuevaContrasenia: formValue.nuevaContrasenia || undefined
      };

      this.authService.updateProfile(updateDto).subscribe({
        next: () => {
          this.message = 'Perfil actualizado correctamente';
          this.error = '';
          this.authService.me().subscribe(); // Refresh user data
          this.isEditing = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar el perfil';
          this.message = '';
        }
      });
    }
  }
  
  logout() {
    this.authService.logout();
  }
}
