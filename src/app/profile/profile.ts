import {ChangeDetectorRef, Component, Inject, PLATFORM_ID} from '@angular/core';
import {EventModel} from '../models/event.model';
import {UserService} from '../services/user.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {isPlatformBrowser} from '@angular/common';
import {Navbar} from '../navbar/navbar';
import {Footer} from '../shared/footer/footer';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLangService } from '../services/translate-lang.service';
import {RouterModule, Router} from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [
    Navbar,
    Footer,
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule // ADD THIS
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  user: any = null;
  events: EventModel[] = [];
  isOrganisateur = false;


  editNom = '';
  editPrenom = '';
  editEmail = '';
  editNomOrganisation = '';
  profileMessage = '';
  profileError = '';

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordMessage = '';
  passwordError = '';

  createdEvents: EventModel[] = [];
  participatedEvents: EventModel[] = [];


  activeTab = 'events';

  deactivating = false;
  deactivationStatus: 'idle' | 'pending' | 'done' = 'idle';

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    // REMOVE: public lang: LangService,
    private translateLang: TranslateLangService, // ADD THIS
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.userService.setUser(JSON.parse(userStr));
      }


      this.userService.currentUser$.subscribe(u => {
        if (u) {
          this.user = u;
          this.isOrganisateur = u.role === 'ROLE_ORGANISATEUR';
          this.editNom = u.nom;
          this.editPrenom = u.prenom;
          this.editEmail = u.email;
          this.editNomOrganisation = u.nomOrganisation;
          this.loadEvents(u.email);
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadEvents(email: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    if (this.isOrganisateur) {
      // Organizer: load both created and participated events
      this.http.get<EventModel[]>(`http://localhost:8081/api/events/created?email=${email}`, { headers })
        .subscribe({
          next: (created) => {
            this.createdEvents = created;
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Failed to load created events', err)
        });

      this.http.get<EventModel[]>(`http://localhost:8081/api/events/my-events?email=${email}`, { headers })
        .subscribe({
          next: (participated) => {
            this.participatedEvents = participated;
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Failed to load participated events', err)
        });
    } else {
      // Participant: only load participated events
      this.http.get<EventModel[]>(`http://localhost:8081/api/events/my-events?email=${email}`, { headers })
        .subscribe({
          next: (data) => {
            this.participatedEvents = data;
            this.cdr.detectChanges();
          },
          error: (err) => console.error('Failed to load events', err)
        });
    }
  }







  updateProfile() {
    this.profileMessage = '';
    this.profileError = '';

    if (!this.editEmail) {
      this.profileError = 'Email est obligatoire.';
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});

    const body = {
      email: this.user.email,
      nom: this.editNom,
      prenom: this.editPrenom,
      newEmail: this.editEmail,
      nomOrganisation: this.editNomOrganisation
    };

    this.http.put('http://localhost:8081/api/user/update-profile', body, {headers}).subscribe({
      next: (response: any) => {
        const updatedUser = {
          ...this.user,
          nom: response.nom,
          prenom: response.prenom,
          email: response.email,
          nomOrganisation: response.nomOrganisation
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.userService.setUser(updatedUser);
        this.profileMessage = 'Profil mis à jour avec succès.';
        this.cdr.detectChanges();
      },
      error: () => {
        this.profileError = 'Erreur lors de la mise à jour.';
      }
    });
  }

  changePassword() {
    this.passwordMessage = '';
    this.passwordError = '';

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Veuillez remplir tous les champs.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({'Authorization': `Bearer ${token}`});

    const body = {
      email: this.user.email,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    };

    this.http.put('http://localhost:8081/api/user/change-password', body, {headers, responseType: 'text'}).subscribe({
      next: () => {
        this.passwordMessage = 'Mot de passe modifié avec succès.';
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.passwordError = err.error || 'Erreur lors du changement de mot de passe.';
      }
    });
  }

  requestDeactivation() {
    if (!confirm('Êtes-vous sûr de vouloir désactiver votre compte ?')) return;
    this.deactivating = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.put('http://localhost:8081/api/user/deactivate', {}, { headers })
      .subscribe({
        next: (res: any) => {
          this.deactivating = false;
          if (res.status === 'PENDING') {
            this.deactivationStatus = 'pending';
          } else {
            this.deactivationStatus = 'done';
            // Log out after deactivation
            setTimeout(() => {
              localStorage.clear();
              this.userService.clearUser();
              this.router.navigate(['/home']);
            }, 2000);
          }
        },
        error: () => { this.deactivating = false; }
      });
  }

}
