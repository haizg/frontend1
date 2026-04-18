import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  currentYear = new Date().getFullYear();
  supportEmail = 'support@invitini.tn';

  platformLinks = [
    { labelKey: 'footer.home',    route: '/home' },
    { labelKey: 'footer.events',  route: '/events' },
    { labelKey: 'footer.about',   route: '/about' },
    { labelKey: 'footer.contact', route: '/contact' },
  ];

  constructor(public modalService: ModalService) {}

  openLogin()  { this.modalService.openLoginModal(); }
  openSignup() { this.modalService.openSignupModal(); }
}

