import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser, NgIf} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {ModalService} from '../services/modal.service';

@Component({
  selector: 'app-navbar',
    imports: [
        NgIf,
        RouterLink
    ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  isLoggedIn=false;

  constructor(private router:Router,
              private modalService: ModalService,
              @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)){
      this.isLoggedIn=!!localStorage.getItem('token')
    }


  }

  logIn(){
    this.modalService.openLoginModal();
  }

  signUp(){
    this.modalService.openSignupModal();
  }

  logOut(){
    if (isPlatformBrowser(this.platformId)){
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
    }
    this.isLoggedIn=false;
    window.location.reload();
    //this.router.navigateByUrl('/', {skipLocationChange:true}).then(() => {
    //  this.router.navigate(['/api/home']);
    //});
  }
}
