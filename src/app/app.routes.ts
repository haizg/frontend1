import { Routes } from '@angular/router';
import {Login} from './login/login';
import {Home} from './home/home';
import {SignUp} from './sign-up/sign-up';
import {SignUpOption} from './sign-up-option/sign-up-option';
import {SignUpOrg} from './sign-up-org/sign-up-org';
import {Popup} from './joinevents/popup/popup';


export const routes: Routes = [
  {path:'api/login', component:Login},
  {path:'api/home',component: Home},
  {path:'api/signup', component:SignUp},
  {path:'api/signupoption',component:SignUpOption},
  {path:'api/signuporg', component:SignUpOrg},
  {path:'api/joinevent', component:Popup}
];
