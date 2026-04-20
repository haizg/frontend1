import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-event-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
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
  approvalMessage = '';
  today = new Date().toISOString().split('T')[0];

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploadingImage = false;
  uploadedImageUrl: string | null = null;

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


  open() {
    this.isVisible = true;
    this.eventForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.approvalMessage = '';
    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadedImageUrl = null;
    this.programType = 'text';
    this.selectedProgramFile = null;
    this.programImagePreview = null;
    this.uploadedProgramImageUrl = null;
  }

  close() {
    this.isVisible = false;
    this.eventForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadedImageUrl = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.approvalMessage = '';
    this.programType = 'text';
    this.selectedProgramFile = null;
    this.programImagePreview = null;
    this.uploadedProgramImageUrl = null;
  }


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.translate.get('createevent.error_image_format').subscribe(msg => {
        this.errorMessage = msg;
      });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.translate.get('createevent.error_image_size').subscribe(msg => {
        this.errorMessage = msg;
      });
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = (e: any) => { this.imagePreview = e.target.result; };
    reader.readAsDataURL(file);
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedFile) return null;
    this.isUploadingImage = true;
    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);
      const response: any = await this.http.post('http://localhost:8081/api/upload', formData).toPromise();
      this.uploadedImageUrl = response.url;
      this.isUploadingImage = false;
      return response.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      this.isUploadingImage = false;
      this.translate.get('createevent.error_upload').subscribe(msg => {
        this.errorMessage = msg;
      });
      return null;
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.uploadedImageUrl = null;
    this.eventForm.patchValue({ imageUrl: '' });
  }


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



  async onSubmit() {
    if (this.eventForm.invalid) {
      this.translate.get('createevent.error_required_fields').subscribe(msg => {
        this.errorMessage = msg;
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.approvalMessage = '';

    try {
      if (this.selectedFile && !this.uploadedImageUrl) {
        const imageUrl = await this.uploadImage();
        if (!imageUrl) { this.isLoading = false; return; }
        this.eventForm.patchValue({ imageUrl });
      }

      if (this.programType === 'image') {
        if (this.selectedProgramFile && !this.uploadedProgramImageUrl) {
          const programUrl = await this.uploadProgramImage();
          if (!programUrl) { this.isLoading = false; return; }
        }
        this.eventForm.patchValue({ program: this.uploadedProgramImageUrl || '' });
      } else {
        this.uploadedProgramImageUrl = null;
      }

      const token = localStorage.getItem('token');
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

      this.http.post('http://localhost:8081/api/events', this.eventForm.value, { headers })
        .subscribe({
          next: (response: any) => {
            console.log('Event created:', response);
            this.isLoading = false;
            this.translate.get('createevent.approval_message').subscribe(msg => {
              this.approvalMessage = msg;
            });
          },
          error: (error) => {
            if (error.status === 403 && error.error?.error === 'ACCOUNT_NOT_VERIFIED') {
              this.translate.get('createevent.error_account_not_verified').subscribe(msg => {
                this.errorMessage = msg;
              });
            } else {
              this.translate.get('createevent.error_create_failed').subscribe(msg => {
                this.errorMessage = msg;
              });
            }
            this.isLoading = false;
          }
        });

    } catch (error) {
      console.error('Error in onSubmit:', error);
      this.translate.get('createevent.error_unexpected').subscribe(msg => {
        this.errorMessage = msg;
      });
      this.isLoading = false;
    }
  }
}
