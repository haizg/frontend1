import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {isPlatformBrowser,CommonModule} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {ModalService} from '../services/modal.service';
import {UserService} from '../services/user.service';
import { TranslateModule } from '@ngx-translate/core';
import { LangService } from '../services/translate.service';
import { importProvidersFrom } from '@angular/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';


@Component({
  selector: 'app-navbar',
    imports: [
        CommonModule,
        RouterLink,
        TranslateModule
    ],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  isLoggedIn=false;
  userName='';
  currentLang = 'fr';


  constructor(private router:Router,
              private modalService: ModalService,
              private userService: UserService,
              private langService: LangService,
              @Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(){
    this.currentLang = this.langService.getCurrentLang();
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

      this.router.navigate(['/api/home']);
  }

  switchLang(lang: 'fr' | 'en') {
    this.langService.switchTo(lang);
    this.currentLang = lang;
  }


}
