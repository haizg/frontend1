import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLangService } from '../services/translate-lang.service';
import { Footer } from '../shared/footer/footer';
import { Login } from '../login/login';
import { SignUpOrg } from '../sign-up/sign-up-org';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterModule, Navbar, TranslateModule, Footer, Login, SignUpOrg],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {
  showLoginModal = false;
  showSignupModal = false;

  constructor(
    private translateLang: TranslateLangService,
    private modalService: ModalService
  ) {}

  ngOnInit() {
    this.modalService.loginModal$.subscribe(state => this.showLoginModal = state);
    this.modalService.signupModal$.subscribe(state => this.showSignupModal = state);
  }
}
