import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../shared/footer/footer';
import { ApiService } from '../services/api.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmation',
  imports: [RouterModule, Navbar, CommonModule, Footer, TranslateModule],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css',
})
export class Confirmation {
  status: 'loading' | 'success' | 'error' = 'loading';

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.route.snapshot.queryParamMap.get('token');
      if (token) {
        this.apiService.confirmToken(token).subscribe({
          next: () => {
            this.status = 'success';
            this.cdr.detectChanges();
          },
          error: () => {
            this.status = 'error';
            this.cdr.detectChanges();
          }
        });
      } else {
        this.status = 'error';
      }
    }
  }
}
