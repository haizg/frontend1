import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ModalService {
  private loginModalOpen = new BehaviorSubject<boolean>(false);
  private signupModalOpen=new BehaviorSubject<boolean>(false);

  loginModal$ = this.loginModalOpen.asObservable();
  signupModal$=this.signupModalOpen.asObservable();

  openLoginModal(){ this.loginModalOpen.next(true);}
  closeLoginModal(){ this.loginModalOpen.next(false);}

  openSignupModal() {this.signupModalOpen.next(true);}
  closeSignupModal(){this.signupModalOpen.next(false);}


}
