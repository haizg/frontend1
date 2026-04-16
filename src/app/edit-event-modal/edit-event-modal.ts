import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { EventModel } from '../models/event.model';

@Component({
  selector: 'app-edit-event-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './edit-event-modal.html',
  styleUrls: ['./edit-event-modal.css']
})
export class EditEventModal {
  @Output() eventUpdated = new EventEmitter<void>();

  eventForm: FormGroup;
  isVisible = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  currentEvent: EventModel | null = null;
  isLocked = false;          // true when event is approved and user is organizer
  minCapacity = 1;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private translate: TranslateService
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      location: ['', Validators.required],
      imageUrl: [''],
      maxParticipants: [null, [Validators.min(1)]],
      program: ['']  // ADD PROGRAM FIELD
    });
  }

  open(event: EventModel, isApproved = false, confirmedCount = 0) {
    this.currentEvent = event;
    this.isLocked = isApproved;
    this.minCapacity = confirmedCount;
    this.isVisible = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      category: event.category,
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl || '',
      maxParticipants: event.maxParticipants || null,
      program: event.program || ''  // ADD PROGRAM VALUE
    });

    const lockedFields = ['title', 'description', 'category', 'date', 'time', 'location', 'imageUrl'];
    if (isApproved) {
      lockedFields.forEach(f => this.eventForm.get(f)?.disable());
      this.eventForm.get('maxParticipants')?.enable();
      this.eventForm.get('program')?.enable();  // ENABLE PROGRAM FOR EDITING EVEN WHEN LOCKED
      this.eventForm.get('maxParticipants')?.setValidators([
        Validators.required,
        Validators.min(confirmedCount || 1)
      ]);
    } else {
      lockedFields.forEach(f => this.eventForm.get(f)?.enable());
      this.eventForm.get('maxParticipants')?.setValidators([Validators.min(1)]);
      this.eventForm.get('program')?.enable();  // ENABLE PROGRAM FOR EDITING
    }
    this.eventForm.get('maxParticipants')?.updateValueAndValidity();
  }

  close() {
    this.isVisible = false;
    this.eventForm.reset();
    Object.keys(this.eventForm.controls).forEach(k => this.eventForm.get(k)?.enable());
    this.isLocked = false;
    this.currentEvent = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit() {
    if (this.eventForm.invalid) {
      this.translate.get('editevent.error_required_fields').subscribe(msg => {
        this.errorMessage = msg;
      });
      return;
    }

    if (!this.currentEvent) {
      this.translate.get('editevent.error_no_event').subscribe(msg => {
        this.errorMessage = msg;
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Prepare update data
    const updateData = {
      maxParticipants: this.eventForm.get('maxParticipants')?.value,
      program: this.eventForm.get('program')?.value  // ADD PROGRAM TO UPDATE DATA
    };

    if (this.isLocked) {
      // When locked, only update capacity AND program
      this.http.put(
        `http://localhost:8081/api/events/${this.currentEvent.id}/capacity-and-program`,
        updateData,
        { headers }
      ).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Capacité et programme mis à jour avec succès.';
          setTimeout(() => { this.close(); this.eventUpdated.emit(); }, 1500);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.status === 403
            ? 'Vous n\'êtes pas autorisé à modifier cet événement.'
            : 'Erreur lors de la mise à jour.';
        }
      });
      return;
    }

    // Full edit for unapproved events - include program
    const fullUpdateData = {
      ...this.eventForm.getRawValue(),
      program: this.eventForm.get('program')?.value  // ENSURE PROGRAM IS INCLUDED
    };

    this.http.put(
      `http://localhost:8081/api/events/${this.currentEvent.id}`,
      fullUpdateData,
      { headers }
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.translate.get('editevent.success_message').subscribe(msg => {
          this.successMessage = msg;
        });
        setTimeout(() => { this.close(); this.eventUpdated.emit(); }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 403) {
          this.translate.get('editevent.error_permission').subscribe(msg => {
            this.errorMessage = msg;
          });
        } else {
          this.translate.get('editevent.error_update_failed').subscribe(msg => {
            this.errorMessage = msg;
          });
        }
      }
    });
  }
}
