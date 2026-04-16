import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../services/modal.service';
import { Router, RouterLink } from "@angular/router";
import { UserService } from '../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-confirm-logout',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './confirm-logout.html',
  styleUrl: './confirm-logout.css',
})
export class ConfirmLogout {
  isOpen = false;

  constructor(public modalService: ModalService,
        private userService: UserService,
        private router: Router) {}

  ngOnInit() {
    this.modalService.logoutModal$.subscribe(state => {
      this.isOpen = state;
    });
  }

  close() {
    this.modalService.closeLogoutModal();
  }

  confirm() {
    this.modalService.closeLogoutModal();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    this.userService.clearUser();
    this.router.navigate(['/home']);
  }
}
