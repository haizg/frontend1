import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangService } from '../../services/lang.service';
import { ModalService } from '../../services/modal.service';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-join-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './join-cta.html',
  styleUrl: './join-cta.css',

})
export class JoinCta {
  constructor(public lang: LangService, private cdr: ChangeDetectorRef, private modalService: ModalService,
                                                                           private userService: UserService){}

  ngOnInit() {
      //this.lang.lang$.subscribe(() => {
        //this.cdr.detectChanges();
      //});
    }
 openAuth() {
    const user = this.userService.getUser();

    if (user) {
      alert('Vous êtes déjà connecté!');
    } else {
      this.modalService.openSignupModal();
    }
  }
}
