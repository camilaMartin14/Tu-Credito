import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorMessage = signal<string>('');
  isLoading = signal<boolean>(false);

  registerForm = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    usuario: ['', Validators.required],
    contrasenia: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      
      const val = this.registerForm.value;
      const dto = {
        nombre: val.nombre!,
        apellido: val.apellido!,
        correo: val.correo!,
        usuario: val.usuario!,
        contrasenia: val.contrasenia!
      };
      
      this.authService.register(dto).subscribe({
        next: () => {
          // Auto login o redirigir a login
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg = err.error?.message || 'Error al registrar. Intente nuevamente.';
          this.errorMessage.set(msg);
          console.error(err);
        }
      });
    }
  }
}
