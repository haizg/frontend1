import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({providedIn: 'root'})
export class ModalService {
  private loginModalOpen = new BehaviorSubject<boolean>(false);
  private signupModalOpen=new BehaviorSubject<boolean>(false);
  private logoutModalOpen = new BehaviorSubject<boolean>(false);
  private joinModalOpen = new BehaviorSubject<boolean>(false);
  private deactivateModalOpen = new BehaviorSubject<boolean>(false);

  loginModal$ = this.loginModalOpen.asObservable();
  signupModal$=this.signupModalOpen.asObservable();
  logoutModal$ = this.logoutModalOpen.asObservable();
  joinModal$=this.joinModalOpen.asObservable();
  deactivateModal$ = this.deactivateModalOpen.asObservable();


  private currentEventID = new BehaviorSubject<number|null>(null);
  currentEventId$ = this.currentEventID.asObservable();


  openLoginModal(){ this.loginModalOpen.next(true);}
  closeLoginModal(){ this.loginModalOpen.next(false);}

  openSignupModal() {this.signupModalOpen.next(true);}
  closeSignupModal(){this.signupModalOpen.next(false);}

  openLogoutModal()  { this.logoutModalOpen.next(true); }
  closeLogoutModal() { this.logoutModalOpen.next(false); }

  openDeactivateModal()  { this.deactivateModalOpen.next(true); }
  closeDeactivateModal() { this.deactivateModalOpen.next(false); }

  openJoinModal(eventId: number){
    this.currentEventID.next(eventId);
    this.joinModalOpen.next(true);}

  closeJoinModal(){
    this.joinModalOpen.next(false);
    this.currentEventID.next(null);}




}
