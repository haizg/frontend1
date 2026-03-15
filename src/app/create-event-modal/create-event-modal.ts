import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-create-event-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-event-modal.html',
  styleUrls: ['./create-event-modal.css']
})
export class CreateEventModal {
  @Output() eventCreated = new EventEmitter<void>();
  eventForm: FormGroup;
  isVisible = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      imageUrl: [''],
      maxParticipants: [null, [Validators.min(1)]]
    });
  }

  open() {
    this.isVisible = true;
    this.eventForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  close() {
    this.isVisible = false;
    this.eventForm.reset();
  }

  onSubmit() {
    if (this.eventForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.post('http://localhost:8081/api/events', this.eventForm.value, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Event created:', response);
          this.successMessage = 'Événement créé avec succès!';
          this.isLoading = false;

          setTimeout(() => {
            this.close();
            this.eventCreated.emit();
            //window.location.reload();
          }, 1500);
        },
        error: (error) => {
          console.error('Error creating event:', error);
          this.errorMessage = 'Erreur lors de la création de l\'événement';
          this.isLoading = false;
        }
      });
  }
}
