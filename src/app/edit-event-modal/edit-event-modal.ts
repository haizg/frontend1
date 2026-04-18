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

  // ── Program image (NEW) ────────────────────────────────────────────────────
  programType: 'text' | 'image' = 'text';
  selectedProgramFile: File | null = null;
  programImagePreview: string | null = null;
  isUploadingProgramImage = false;
  uploadedProgramImageUrl: string | null = null;

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

  // ── open() — existing logic + program image detection (NEW at bottom) ───────

  open(event: EventModel, isApproved = false, confirmedCount = 0, isAdmin = false) {
    this.currentEvent = event;
    this.isAdmin = isAdmin;
    this.isLocked = isApproved && !isAdmin;
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

    // ── NEW: Detect if program is a stored image URL ────────────────────────
    const existingProgram = (event as any).program || '';
    const looksLikeImageUrl = existingProgram.startsWith('http') &&
      /\.(png|jpg|jpeg|webp|gif)/i.test(existingProgram);

    if (looksLikeImageUrl) {
      this.programType = 'image';
      this.uploadedProgramImageUrl = existingProgram;
      this.programImagePreview = existingProgram;
      // Clear the text field since the value is actually an image URL
      this.eventForm.patchValue({ program: '' });
    } else {
      this.programType = 'text';
      this.uploadedProgramImageUrl = null;
      this.programImagePreview = null;
    }
    // ── END NEW ─────────────────────────────────────────────────────────────
  }

  // ── close() — existing logic + reset program image state (NEW) ──────────────

  close() {
    this.isVisible = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.currentEvent = null;
    this.isLocked = false;
    this.isAdmin = false;
    Object.keys(this.eventForm.controls).forEach(k => this.eventForm.get(k)?.enable());
    this.eventForm.reset();
    // ── NEW reset ────────────────────────────────────────────────────────────
    this.programType = 'text';
    this.selectedProgramFile = null;
    this.programImagePreview = null;
    this.uploadedProgramImageUrl = null;
    // ── END NEW reset ────────────────────────────────────────────────────────
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  // ── Program image methods (NEW) ────────────────────────────────────────────

  onProgramTypeChange(type: 'text' | 'image') {
    this.programType = type;
    if (type === 'text') {
      this.selectedProgramFile = null;
      this.programImagePreview = null;
      this.uploadedProgramImageUrl = null;
    } else {
      this.eventForm.patchValue({ program: '' });
    }
  }

  onProgramFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Le programme doit être une image valide.';
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = "L'image du programme ne doit pas dépasser 10 Mo.";
      return;
    }

    this.selectedProgramFile = file;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = (e: any) => { this.programImagePreview = e.target.result; };
    reader.readAsDataURL(file);
  }

  async uploadProgramImage(): Promise<string | null> {
    if (!this.selectedProgramFile) return null;
    this.isUploadingProgramImage = true;
    try {
      const formData = new FormData();
      formData.append('file', this.selectedProgramFile);
      const response: any = await this.http.post('http://localhost:8081/api/upload', formData).toPromise();
      this.uploadedProgramImageUrl = response.url;
      this.isUploadingProgramImage = false;
      return response.url;
    } catch (error) {
      console.error('Error uploading program image:', error);
      this.isUploadingProgramImage = false;
      this.errorMessage = "Erreur lors du téléchargement de l'image du programme.";
      return null;
    }
  }

  removeProgramImage() {
    this.selectedProgramFile = null;
    this.programImagePreview = null;
    this.uploadedProgramImageUrl = null;
  }

  // ── onSubmit() — existing logic + program image extension (NEW blocks) ───────

  async onSubmit() {
    if (!this.currentEvent) return;

    if (this.eventForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // ── NEW: Resolve program field before sending ─────────────────────────────
    if (this.programType === 'image') {
      if (this.selectedProgramFile && !this.uploadedProgramImageUrl) {
        const programUrl = await this.uploadProgramImage();
        if (!programUrl) { this.isLoading = false; return; }
      }
      this.eventForm.patchValue({ program: this.uploadedProgramImageUrl || '' });
    } else {
      this.uploadedProgramImageUrl = null;
    }
    // ── END NEW ───────────────────────────────────────────────────────────────

    const id = this.currentEvent.id;
    const raw = this.eventForm.getRawValue();

    // ADMIN path (existing, unchanged)
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

    // ORGANIZER LOCKED path (existing, unchanged)
    if (this.isLocked) {
      this.http.put(
        `http://localhost:8081/api/events/${id}/capacity-and-program`,
        { maxParticipants: raw.maxParticipants, program: raw.program },
        { headers: this.getHeaders() }
      ).subscribe({
        next: () => this.handleSuccess('Capacité et programme mis à jour.'),
        error: (err) => this.handleError(err)
      });
      return;
    }
  }

  private handleSuccess(msg?: string) {
    this.isLoading = false;
    this.successMessage = msg || 'Événement mis à jour avec succès.';
    setTimeout(() => { this.close(); this.eventUpdated.emit(); }, 1500);
  }

  private handleError(err: any) {
    this.isLoading = false;
    this.errorMessage = err.status === 403
      ? "Vous n'êtes pas autorisé à modifier cet événement."
      : 'Erreur lors de la mise à jour. Réessayez.';
  }
}
