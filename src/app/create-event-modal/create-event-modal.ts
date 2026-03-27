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
  today = new Date().toISOString().split('T')[0];
  selectedFile: File | null = null;
    imagePreview: string | null = null;
    isUploadingImage = false;
    uploadedImageUrl: string | null = null;

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
      this.selectedFile = null;
        this.imagePreview = null;
        this.uploadedImageUrl = null;
  }

  close() {
    this.isVisible = false;
    this.eventForm.reset();
      this.selectedFile = null;
        this.imagePreview = null;
        this.uploadedImageUrl = null;
  }
onFileSelected(event: any) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Veuillez sélectionner une image (JPEG, PNG, GIF)';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = 'L\'image ne doit pas dépasser 10 MB';
      return;
    }

    this.selectedFile = file;
    this.errorMessage = '';

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imagePreview = e.target.result;
    };
    reader.readAsDataURL(file);

    console.log('✅ File selected:', file.name, file.size, 'bytes');
  }
 async uploadImage(): Promise<string | null> {
    if (!this.selectedFile) {
      return null;
    }

    this.isUploadingImage = true;

    try {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      console.log('📤 Uploading image to MinIO...');

      const response: any = await this.http.post(
        'http://localhost:8081/api/upload',
        formData
      ).toPromise();

      console.log('✅ Image uploaded:', response);

      this.uploadedImageUrl = response.url;
      this.isUploadingImage = false;

      return response.url;

    } catch (error) {
      console.error('❌ Error uploading image:', error);
      this.isUploadingImage = false;
      this.errorMessage = 'Erreur lors du téléchargement de l\'image';
      return null;
    }
  }

   async onSubmit() {
      if (this.eventForm.invalid) {
        this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';

      try {
        if (this.selectedFile && !this.uploadedImageUrl) {
          console.log('📤 Uploading image first...');
          const imageUrl = await this.uploadImage();

          if (!imageUrl) {
            this.isLoading = false;
            return;
          }

          this.eventForm.patchValue({ imageUrl: imageUrl });
        }

        const token = localStorage.getItem('token');
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        console.log('📝 Creating event with data:', this.eventForm.value);

        this.http.post('http://localhost:8081/api/events', this.eventForm.value, { headers })
          .subscribe({
            next: (response: any) => {
              console.log('✅ Event created:', response);
              this.successMessage = 'Événement créé avec succès!';
              this.isLoading = false;

              setTimeout(() => {
                this.close();
                this.eventCreated.emit();
              }, 1500);
            },
            error: (error) => {
              console.error('❌ Error creating event:', error);
              this.errorMessage = 'Erreur lors de la création de l\'événement';
              this.isLoading = false;
            }
          });

      } catch (error) {
        console.error('❌ Error in onSubmit:', error);
        this.errorMessage = 'Une erreur est survenue';
        this.isLoading = false;
      }
    }

    removeImage() {
      this.selectedFile = null;
      this.imagePreview = null;
      this.uploadedImageUrl = null;
      this.eventForm.patchValue({ imageUrl: '' });
    }
  }
