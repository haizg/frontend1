import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser,CommonModule} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {ModalService} from '../services/modal.service';
import {UserService} from '../services/user.service';

@Component({
  selector: 'app-navbar',
    imports: [
        CommonModule,
        RouterLink
    ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  isLoggedIn=false;
  userName='';

  constructor(private router:Router,
              private modalService: ModalService,
              private userService: UserService,
              @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(){
    if (isPlatformBrowser(this.platformId)){
      const userStr = localStorage.getItem('user');
      if (userStr){
        this.userService.setUser(JSON.parse(userStr));
      }
    }

    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.isLoggedIn=true;
        this.userName=user.prenom+' '+user.nom;
      }else {
        this.isLoggedIn=false;
        this.userName='';
      }
    });
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
    this.userService.clearUser();

  }
}
