import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Navbar } from '../navbar/navbar';
import { Footer } from '../shared/footer/footer';
import { ApiService } from '../services/api.service';
import { TranslateModule } from '@ngx-translate/core';
import { Login } from '../login/login';
import { SignUpOrg } from '../sign-up/sign-up-org';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-organizer-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, Navbar, Footer, RouterModule, TranslateModule, Login, SignUpOrg],
  templateUrl: './organizer-profile.html',
  styleUrls: ['./organizer-profile.css']
})
export class OrganizerProfile implements OnInit {
  organizer: any = null;
  pastEvents: any[] = [];
  upcomingEvents: any[] = [];
  isLoading = true;
  notFound = false;
  showLoginModal = false;
  showSignupModal = false;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private modalService: ModalService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.modalService.loginModal$.subscribe(state => {
      this.showLoginModal = state;
      this.cdr.markForCheck();
    });

    this.modalService.signupModal$.subscribe(state => {
      this.showSignupModal = state;
      this.cdr.markForCheck();
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.notFound = true; return; }

    this.apiService.getOrganizerProfile(id).subscribe({
      next: (data: any) => {
        this.organizer = data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.pastEvents = (data.events || []).filter((e: any) => {
          const d = new Date(e.date);
          d.setHours(0, 0, 0, 0);
          return d < today;
        }).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

        this.upcomingEvents = (data.events || []).filter((e: any) => {
          const d = new Date(e.date);
          d.setHours(0, 0, 0, 0);
          return d >= today;
        }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.notFound = true;
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  get starsArray(): number[] { return [1, 2, 3, 4, 5]; }

  isStarFilled(star: number): boolean {
    return star <= Math.round(this.organizer?.averageRating || 0);
  }

  get initials(): string {
    if (!this.organizer) return '';
    return `${this.organizer.prenom?.charAt(0) || ''}${this.organizer.nom?.charAt(0) || ''}`;
  }
}
