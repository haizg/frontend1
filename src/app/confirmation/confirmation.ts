import {ChangeDetectorRef, Component, Inject, PLATFORM_ID} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {isPlatformBrowser} from '@angular/common';
import {subscribe} from 'node:diagnostics_channel';
import {Navbar} from '../navbar/navbar';
import {Footer} from '../shared/footer/footer';
import {CommonModule} from '@angular/common';

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
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(){
    if (isPlatformBrowser(this.platformId)) {
      const token = this.route.snapshot.queryParamMap.get('token');
      console.log('Token from url : ',token);
      if (token) {
        console.log('calling backend with token :', token);
        this.http.get(`http://localhost:8081/api/events/confirm?token=${token}`,
          { responseType: 'text' }
        ).subscribe({
          next: (response) => {
            console.log('backend response:', response);
            this.status = 'success';
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.log('backend error: ', err);
            this.status = 'error';
            this.cdr.detectChanges();
          }
        });
      } else {
        console.log('no token found in url');
        this.status = 'error';
      }
    }
  }


}
