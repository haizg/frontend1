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
      maxParticipants: [null, [Validators.min(1)]]
    });
  }

  open(event: EventModel) {
    this.currentEvent = event;
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
      maxParticipants: event.capacity || null
    });
  }

  close() {
    this.isVisible = false;
    this.eventForm.reset();
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

    this.http.put(
      `http://localhost:8081/api/events/${this.currentEvent.id}`,
      this.eventForm.value,
      { headers }
    ).subscribe({
      next: (response: any) => {
        console.log('Event updated:', response);
        this.isLoading = false;

        this.translate.get('editevent.success_message').subscribe(msg => {
          this.successMessage = msg;
        });

        setTimeout(() => {
          this.close();
          this.eventUpdated.emit();
        }, 1500);
      },
      error: (error) => {
        console.error('Error updating event:', error);
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
