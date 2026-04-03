import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { isPlatformBrowser, CommonModule } from "@angular/common";
import { Router, RouterLink } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalService } from '../services/modal.service';
import { UserService } from '../services/user.service';
import { TranslateLangService } from '../services/translate-lang.service';

@Component({
  selector: 'app-navbar',
  standalone: true,  // Make sure this is standalone
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TranslateModule  // IMPORTANT: Add this for translate pipe
  ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar implements OnInit {
  isLoggedIn = false;
  userName = '';
  currentLang = 'fr';
  userRole = '';

  constructor(
    private router: Router,
    private modalService: ModalService,
    private userService: UserService,
public translateLangService: TranslateLangService,  // Change private to public    private translateService: TranslateService,  // For direct use if needed
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // Subscribe to language changes
    this.translateLangService.currentLang$.subscribe(lang => {
      this.currentLang = lang;
    });

    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.userService.setUser(JSON.parse(userStr));
      }
    }

    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.isLoggedIn = true;
        this.userName = user.prenom + ' ' + user.nom;
        this.userRole = user.role;
      } else {
        this.isLoggedIn = false;
        this.userName = '';
        this.userRole = '';
      }
    });
  }

  logIn() {
    this.modalService.openLoginModal();
  }

  signUp() {
    this.modalService.openSignupModal();
  }

  logOut() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    }
    this.isLoggedIn = false;
    this.userService.clearUser();
    this.router.navigate(['/api/home']);
  }

  get isAdmin(): boolean {
    return this.userRole === 'ROLE_ADMIN';
  }
}
