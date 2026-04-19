import {ChangeDetectorRef, Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {EventModel} from '../models/event.model';

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
  isVisible  = false;
  isLoading  = false;
  errorMessage   = '';
  successMessage = '';
  currentEvent: EventModel | null = null;
  isLocked = false;
  isAdmin  = false;
  minCapacity = 1;

  // program image state
  programType: 'text' | 'image' = 'text';
  selectedProgramFile: File | null = null;
  programImagePreview: string | null = null;
  isUploadingProgramImage = false;
  uploadedProgramImageUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef          // ← ADDED
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

  // ── open() ───────────────────────────────────────────────────────────────────

  open(event: EventModel, isApproved = false, confirmedCount = 0, isAdmin = false) {
    this.currentEvent = event;
    this.isAdmin      = isAdmin;
    this.isLocked     = isApproved && !isAdmin;
    this.minCapacity  = confirmedCount;
    this.isVisible    = true;
    this.errorMessage   = '';
    this.successMessage = '';

    // Detect program type BEFORE patching so textarea is correct
    const existingProgram = (event as any).program || '';
    const looksLikeImageUrl =
      existingProgram.startsWith('http') &&
      /\.(png|jpg|jpeg|webp|gif)(\?.*)?$/i.test(existingProgram);

    if (looksLikeImageUrl) {
      this.programType             = 'image';
      this.uploadedProgramImageUrl = existingProgram;
      this.programImagePreview     = existingProgram;
    } else {
      this.programType             = 'text';
      this.uploadedProgramImageUrl = null;
      this.programImagePreview     = null;
    }

    this.eventForm.patchValue({
      title:           event.title,
      description:     event.description,
      category:        event.category,
      date:            event.date,
      time:            event.time,
      location:        event.location,
      imageUrl:        event.imageUrl || '',
      maxParticipants: event.maxParticipants || null,
      program:         looksLikeImageUrl ? '' : existingProgram
    });

    // Enable all, then lock as needed
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

    this.cdr.markForCheck();
  }

  // ── close() ──────────────────────────────────────────────────────────────────

  close() {
    this.isVisible       = false;
    this.errorMessage    = '';
    this.successMessage  = '';
    this.currentEvent    = null;
    this.isLocked        = false;
    this.isAdmin         = false;
    Object.keys(this.eventForm.controls).forEach(k => this.eventForm.get(k)?.enable());
    this.eventForm.reset();
    this.programType             = 'text';
    this.selectedProgramFile     = null;
    this.programImagePreview     = null;
    this.uploadedProgramImageUrl = null;
    this.cdr.markForCheck();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({'Authorization': `Bearer ${token}`});
  }

  // ── Program image methods ─────────────────────────────────────────────────────

  onProgramTypeChange(type: 'text' | 'image') {
    this.programType = type;
    if (type === 'text') {
      this.selectedProgramFile     = null;
      this.programImagePreview     = null;
      this.uploadedProgramImageUrl = null;
    } else {
      this.eventForm.patchValue({program: ''});
    }
    this.cdr.markForCheck();
  }

  onProgramFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage = this.translate.instant('editevent.program_image_error_format');
      this.cdr.markForCheck();
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = this.translate.instant('editevent.program_image_error_size');
      this.cdr.markForCheck();
      return;
    }

    // Reset previous upload — forces re-upload of the new file
    this.uploadedProgramImageUrl = null;
    this.selectedProgramFile     = file;
    this.programImagePreview     = null;   // clear old preview immediately
    this.errorMessage            = '';
    this.cdr.markForCheck();               // ← show cleared state right away

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.programImagePreview = e.target.result;
      this.cdr.markForCheck(); // ← THIS is the critical fix: update after FileReader async callback
    };
    reader.readAsDataURL(file);
  }

  async uploadProgramImage(): Promise<string | null> {
    if (!this.selectedProgramFile) return null;
    this.isUploadingProgramImage = true;
    this.cdr.markForCheck();

    try {
      const formData = new FormData();
      formData.append('file', this.selectedProgramFile);
      const response: any = await this.http
        .post('http://localhost:8081/api/upload', formData)
        .toPromise();
      this.uploadedProgramImageUrl = response.url;
      this.isUploadingProgramImage = false;
      this.cdr.markForCheck();
      return response.url;
    } catch (error) {
      console.error('Error uploading program image:', error);
      this.isUploadingProgramImage = false;
      this.errorMessage = this.translate.instant('editevent.program_image_error_upload');
      this.cdr.markForCheck();
      return null;
    }
  }

  removeProgramImage() {
    this.selectedProgramFile     = null;
    this.programImagePreview     = null;
    this.uploadedProgramImageUrl = null;
    this.cdr.markForCheck();
  }

  // ── onSubmit() ───────────────────────────────────────────────────────────────

  async onSubmit() {
    if (!this.currentEvent) return;

    if (this.eventForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading     = true;
    this.errorMessage  = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    // Resolve program field
    if (this.programType === 'image') {
      if (this.selectedProgramFile && !this.uploadedProgramImageUrl) {
        const programUrl = await this.uploadProgramImage();
        if (!programUrl) {
          this.isLoading = false;
          this.cdr.markForCheck();
          return;
        }
      }
      this.eventForm.patchValue({program: this.uploadedProgramImageUrl || ''});
    } else {
      this.uploadedProgramImageUrl = null;
    }

    const id  = this.currentEvent.id;
    const raw = this.eventForm.getRawValue();

    // ADMIN: full update
    if (this.isAdmin) {
      this.http.put(
        `http://localhost:8081/api/admin/update-event/${id}`,
        raw,
        {headers: this.getHeaders()}
      ).subscribe({
        next: () => this.handleSuccess(),
        error: (err) => this.handleError(err)
      });
      return;
    }

    // ORGANIZER LOCKED: capacity + program only
    if (this.isLocked) {
      this.http.put(
        `http://localhost:8081/api/events/${id}/capacity-and-program`,
        {maxParticipants: raw.maxParticipants, program: raw.program},
        {headers: this.getHeaders()}
      ).subscribe({
        next: () => this.handleSuccess('Capacité et programme mis à jour.'),
        error: (err) => this.handleError(err)
      });
      return;
    }
  }

  private handleSuccess(msg?: string) {
    this.isLoading      = false;
    this.successMessage = msg || 'Événement mis à jour avec succès.';
    this.cdr.markForCheck();
    setTimeout(() => {
      this.close();
      this.eventUpdated.emit();
    }, 1500);
  }

  private handleError(err: any) {
    this.isLoading    = false;
    this.errorMessage = err.status === 403
      ? "Vous n'êtes pas autorisé à modifier cet événement."
      : 'Erreur lors de la mise à jour. Réessayez.';
    this.cdr.markForCheck();
  }
}
