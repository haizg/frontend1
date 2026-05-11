import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Navbar } from '../navbar/navbar';
import { TranslateModule } from '@ngx-translate/core';
import { BrowserQRCodeReader } from '@zxing/browser';
@Component({
  selector: 'app-scan-event',
  standalone: true,
  imports: [CommonModule, RouterModule, Navbar, TranslateModule],
  templateUrl: './scan-event.html',
  styleUrl: './scan-event.css'
})
export class ScanEvent implements OnInit, OnDestroy {
  eventId: number | null = null;
  scanResult: any = null;  // holds the last scan response
  scanError = '';
  isScanning = false;
  codeReader: any = null;  // ZXing reader instance

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    if (isPlatformBrowser(this.platformId)) {
      this.startCamera();
    }
  }

  async startCamera() {
    this.isScanning = true;
    this.scanError = '';
    this.scanResult = null;

    try {
      // Dynamically import ZXing to avoid SSR issues
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      this.codeReader = new BrowserQRCodeReader();

      const videoElement = document.getElementById('qr-video') as HTMLVideoElement;

      // Start continuous scanning — callback fires every time a QR is detected
      await this.codeReader.decodeFromVideoDevice(
        undefined, // undefined = use default camera
        videoElement,
        (result: any, error: any) => {
          if (result) {
            const token = result.getText();
            // Only send one scan request at a time
            if (!this.scanResult || this.scanResult.scannedToken !== token) {
              this.processScan(token);
            }
          }
        }
      );
    } catch (err) {
      this.scanError = 'Impossible d\'accéder à la caméra. Vérifiez les permissions.';
      this.isScanning = false;
    }
  }

  processScan(token: string) {
    // Prevent duplicate API calls for same token
    if (this.scanResult?.scannedToken === token) return;

    this.apiService.scanQrToken(token).subscribe({
      next: (res: any) => {
        // Store result with the scanned token to prevent duplicate scans
        this.scanResult = { ...res, scannedToken: token };
      },
      error: (err: any) => {
        this.scanResult = {
          status: 'ERROR',
          message: err.error?.message || 'QR code invalide.',
          scannedToken: token
        };
      }
    });
  }

  resetScan() {
    // Clear result so organizer can scan next participant
    this.scanResult = null;
  }

  ngOnDestroy() {
    // Stop camera when leaving page to free resources
    if (this.codeReader) {
      BrowserQRCodeReader.releaseAllStreams();
    }
  }
}
