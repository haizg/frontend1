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
  isLocked = false;
  isAdmin = false;
  minCapacity = 1;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private translate: TranslateService
  ) {
    this.eventForm = this.fb.group({
      title:           ['', [Validators.required, Validators.minLength(3)]],
      description:     ['', [Validators.required, Validators.minLength(10)]],
      category:        ['', Validators.required],
      date:            ['', Validators.required],
      time:            ['', Validators.required],
      location:        ['', Validators.required],
      imageUrl:        [''],
      maxParticipants: [null, [Validators.min(1)]],
      program:         ['']
    });
  }

  open(event: EventModel, isApproved = false, confirmedCount = 0, isAdmin = false) {
    this.currentEvent = event;
    this.isAdmin = isAdmin;
    this.isLocked = isApproved && !isAdmin; // admin is never locked
    this.minCapacity = confirmedCount;
    this.isVisible = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.eventForm.patchValue({
      title:           event.title,
      description:     event.description,
      category:        event.category,
      date:            event.date,
      time:            event.time,
      location:        event.location,
      imageUrl:        event.imageUrl || '',
      maxParticipants: event.maxParticipants || null,
      program:         (event as any).program || ''
    });

    // Enable all first
    Object.keys(this.eventForm.controls).forEach(k => this.eventForm.get(k)?.enable());

    if (this.isLocked) {
      // Organizer on approved event: lock most fields
      ['title', 'description', 'category', 'date', 'time', 'location', 'imageUrl']
        .forEach(f => this.eventForm.get(f)?.disable());

      this.eventForm.get('maxParticipants')?.setValidators([
        Validators.required,
        Validators.min(confirmedCount || 1)
      ]);
    } else {
      this.eventForm.get('maxParticipants')?.setValidators([Validators.min(1)]);
    }

    this.eventForm.get('maxParticipants')?.updateValueAndValidity();
  }

  close() {
    this.isVisible = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.currentEvent = null;
    this.isLocked = false;
    this.isAdmin = false;
    Object.keys(this.eventForm.controls).forEach(k => this.eventForm.get(k)?.enable());
    this.eventForm.reset();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  onSubmit() {
    if (!this.currentEvent) return;

    if (this.eventForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const id = this.currentEvent.id;
    const raw = this.eventForm.getRawValue(); // includes disabled fields

    // ADMIN: use admin endpoint, no role restriction
    if (this.isAdmin) {
      this.http.put(
        `http://localhost:8081/api/admin/update-event/${id}`,
        raw,
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
      return;
    }

    // ORGANIZER LOCKED: only capacity + program
    if (this.isLocked) {
      this.http.put(
        `http://localhost:8081/api/events/${id}/capacity-and-program`,
        {
          maxParticipants: raw.maxParticipants,
          program: raw.program
        },
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => this.handleSuccess('Capacité et programme mis à jour.'),
        error: (err) => this.handleError(err)
      });
      return;
    }
/*
    // ORGANIZER NOT LOCKED: full update
    this.http.put(
      `http://localhost:8081/api/events/${id}`,
      raw,
      { headers: this.getHeaders() }
    ).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err)
    });
  */
  }

  private handleSuccess(msg?: string) {
    this.isLoading = false;
    this.successMessage = msg || 'Événement mis à jour avec succès.';
    setTimeout(() => { this.close(); this.eventUpdated.emit(); }, 1500);
  }

  private handleError(err: any) {
    this.isLoading = false;
    this.errorMessage = err.status === 403
      ? 'Vous n\'êtes pas autorisé à modifier cet événement.'
      : 'Erreur lors de la mise à jour. Réessayez.';
  }
}
