import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLangService } from '../../services/translate-lang.service';
import { ModalService } from '../../services/modal.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-join-cta',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './join-cta.html',
  styleUrl: './join-cta.css',

})
export class JoinCta {
  constructor(
    private translateLang: TranslateLangService,
    private cdr: ChangeDetectorRef,
    private modalService: ModalService,
    private userService: UserService
  ){}
  showAlreadyMsg = false;

  onJoinClick() {
    if (this.userService.getUser()) {
      this.showAlreadyMsg = true;
      setTimeout(() => {
        this.showAlreadyMsg = false;
        this.cdr.detectChanges();
      }, 3000);
      return;
    }
    this.modalService.openLoginModal();
  }

}
