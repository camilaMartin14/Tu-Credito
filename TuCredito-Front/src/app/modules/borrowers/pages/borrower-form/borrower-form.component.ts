import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { BorrowerService } from '../services/borrower.service';
import { Prestatario } from '../models/borrower.models';

@Component({
  selector: 'app-borrower-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './borrower-form.component.html',
  styleUrls: ['./borrower-form.component.scss']
})
export class BorrowerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private borrowerService = inject(BorrowerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  currentId = signal<number | null>(null);
  errorMessage = signal<string>('');

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
    telefono: ['', Validators.required],
    domicilio: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    // Datos del garante
    garanteNombre: [''],
    garanteApellido: [''],
    garanteDni: [''],
    garanteTelefono: [''],
    garanteDomicilio: [''],
    garanteCorreo: ['']
  });

  ngOnInit() {
    // Check for edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.currentId.set(Number(id));
      this.loadBorrower(Number(id));
    }
  }

  loadBorrower(id: number) {
    this.isLoading.set(true);
    this.borrowerService.getByDni(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni?.toString(),
          telefono: data.telefono,
          domicilio: data.domicilio,
          correo: data.correo,
          garanteNombre: data.garanteNombre,
          garanteApellido: data.garanteApellido,
          garanteTelefono: data.garanteTelefono,
          garanteDomicilio: data.garanteDomicilio,
          garanteCorreo: data.garanteCorreo
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage.set('Error al cargar el cliente');
        this.isLoading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const val = this.form.value;
      const borrowerData: any = {
        nombre: val.nombre!,
        apellido: val.apellido!,
        dni: Number(val.dni!),
        telefono: val.telefono!,
        domicilio: val.domicilio!,
        correo: val.correo!,
        esActivo: true
      };

      // Si hay datos del garante, agregamos el objeto de navegación
      if (val.garanteNombre || val.garanteApellido) {
        borrowerData.idGaranteNavigation = {
          nombre: val.garanteNombre || '',
          apellido: val.garanteApellido || '',
          telefono: val.garanteTelefono || '',
          domicilio: val.garanteDomicilio || '',
          correo: val.garanteCorreo || '',
          esActivo: true
        };
        // Nota: La entidad Garante no tiene campo DNI en el backend actual
      }

      // Handle garante logic if needed (backend might expect specific structure)
      // For now assuming flat structure or separate handling based on backend
      // Adjusting based on Prestatario interface which has idGaranteNavigation
      
      // If creating new
      if (!this.isEditMode()) {
        this.borrowerService.create(borrowerData).subscribe({
          next: () => {
            this.router.navigate(['/clients']);
          },
          error: (err) => {
            console.error(err);
            this.errorMessage.set(err.error?.message || 'Error al guardar el cliente');
            this.isLoading.set(false);
          }
        });
      } else {
        // Update logic
        this.borrowerService.update(this.currentId()!, borrowerData).subscribe({
          next: () => {
            this.router.navigate(['/clients']);
          },
          error: (err) => {
            console.error(err);
            this.errorMessage.set(err.error?.message || 'Error al actualizar el cliente');
            this.isLoading.set(false);
          }
        });
      }
    } else {
      this.form.markAllAsTouched();
    }
  }
}
