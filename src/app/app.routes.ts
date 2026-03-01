import { Routes } from '@angular/router';
import {Login} from './login/login';
import {Home} from './home/home';
import {SignUpOrg} from './sign-up/sign-up-org';
import {Popup} from './joinevents/popup/popup';
import {EventDetail} from './event-detail/event-detail';


export const routes: Routes = [
  {path:'api/login', component:Login},
  {path:'api/home',component: Home},
  {path:'api/signuporg', component:SignUpOrg},
  {path:'api/joinevent', component:Popup},
  {path:'api/events/:id', component:EventDetail}
];
