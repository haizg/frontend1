import {ChangeDetectorRef, Component, Inject, PLATFORM_ID} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {isPlatformBrowser} from '@angular/common';
import {subscribe} from 'node:diagnostics_channel';
import {Navbar} from '../navbar/navbar';
import {Footer} from '../shared/footer/footer';
import {CommonModule} from '@angular/common';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-confirmation',
  imports: [RouterModule, Navbar, CommonModule, Footer],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.css',
})
export class Confirmation {
  status: 'loading' | 'success' | 'error' ='loading';

  constructor(
    private route: ActivatedRoute,
    private apiService : ApiService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(){
    if (isPlatformBrowser(this.platformId)) {
      const token = this.route.snapshot.queryParamMap.get('token');
      if (token) {
        this.apiService.confirmToken(token).subscribe({
          next: (response) => {
            this.status = 'success';
            this.cdr.detectChanges();
          },
          error: (err : 'text') => {
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
