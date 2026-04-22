import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalService } from '../../services/modal.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {
  currentYear = new Date().getFullYear();
  supportEmail = 'support@invitini.tn';

  isLoggedIn = false;
  userRole = '';
  footerMessage = '';

  platformLinks = [
    { labelKey: 'footer.home',    route: '/home' },
    { labelKey: 'footer.events',  route: '/events' },
    { labelKey: 'footer.about',   route: '/about' },
    { labelKey: 'footer.contact', route: '/contact' },
  ];

  constructor(
    public modalService: ModalService,
    private userService: UserService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.userService.currentUser$.subscribe(user => {
        this.isLoggedIn = !!user;
        this.userRole = user?.role || '';
        this.footerMessage = '';
      });
    }
  }

  private showMessage(key: string, duration = 3000) {
    this.translate.get(key).subscribe((msg: string) => {
      this.footerMessage = msg;
      setTimeout(() => this.footerMessage = '', duration);
    });
  }

  openLogin() {
    if (this.isLoggedIn) {
      this.showMessage('footer.msg_already_logged_in');
      return;
    }
    this.modalService.openLoginModal();
  }

  openSignup() {
    if (this.isLoggedIn) {
      this.showMessage('footer.msg_already_has_account');
      return;
    }
    this.modalService.openSignupModal();
  }

  openBecomeOrganizer() {
    if (!this.isLoggedIn) {
      this.modalService.openSignupModal();
      return;
    }
    if (this.userRole === 'ROLE_ORGANISATEUR') {
      this.showMessage('footer.msg_already_organizer');
    } else if (this.userRole === 'ROLE_ADMIN') {
      this.showMessage('footer.msg_is_admin');
    } else {
      this.showMessage('footer.msg_is_participant', 6000);
    }
  }
}
