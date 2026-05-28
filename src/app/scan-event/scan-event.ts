import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Navbar } from '../navbar/navbar';
import { TranslateModule } from '@ngx-translate/core';
import jsQR from 'jsqr';

@Component({
  selector: 'app-scan-event',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, TranslateModule],
  templateUrl: './scan-event.html',
  styleUrl: './scan-event.css'
})
export class ScanEvent implements OnInit, OnDestroy {
  eventId: number | null = null;
  scanResult: any = null;
  scanError = '';

  private stream: MediaStream | null = null;
  private scanning = false;
  private processing = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (isPlatformBrowser(this.platformId)) {
      await this.startCamera();
    }
  }

  async startCamera() {
    try {
      const video = document.getElementById('qr-video') as HTMLVideoElement;
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' }
      });
      video.srcObject = this.stream;
      await video.play();
      this.scanning = true;
      this.scanFrames(video);
    } catch (err) {
      this.scanError = 'Impossible d\'accéder à la caméra';
      this.cdr.markForCheck();
    }
  }

  scanFrames(video: HTMLVideoElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scan = () => {
      if (!this.scanning) return;

      if (this.scanResult) {
        requestAnimationFrame(scan);
        return;
      }

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qrCode = (jsQR as any)(imageData.data, imageData.width, imageData.height);

        if (qrCode && qrCode.data && !this.processing) {
          this.processing = true;
          this.processScan(qrCode.data);
        }
      }
      requestAnimationFrame(scan);
    };
    scan();
  }

  processScan(token: string) {
    this.apiService.scanQrToken(token).subscribe({
      next: (res: any) => {
        this.scanResult = { ...res, scannedToken: token };
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        const error = err.error?.error;
        const message = err.error?.message || 'QR invalide';

        if (error === 'NOT_TODAY') {
          this.scanError = message;
          this.processing = false;
          this.cdr.markForCheck();

          setTimeout(() => {
            this.scanError = '';
            this.cdr.markForCheck();
          }, 3000);
        } else {
          this.scanResult = { status: 'ERROR', message };
          this.cdr.markForCheck();
        }
      }
    });
  }

  resetScan() {
    this.scanResult = null;
    this.processing = false;
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    this.scanning = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }
}
