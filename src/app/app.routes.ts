import { Routes } from '@angular/router';
import {Login} from './login/login';
import {Home} from './home/home';
import {SignUpOrg} from './sign-up/sign-up-org';
import {Popup} from './joinevents/popup/popup';
import {EventDetail} from './event-detail/event-detail';
import {Profile} from './profile/profile';
import {EventsPage} from './events-page/events-page';
import {Confirmation} from './confirmation/confirmation';
import { ResetPassword } from './reset-password/reset-password';


export const routes: Routes = [
  {path:'api/login', component:Login},
  {path:'api/home',component: Home},
  {path:'api/signuporg', component:SignUpOrg},
  {path:'api/joinevent', component:Popup},
  {path:'api/profile', component:Profile},
  {path:'api/events', component:EventsPage},
  {path:'api/events/:id', component:EventDetail},
  {path:'api/confirm', component: Confirmation},
 { path: 'api/reset-password', component: ResetPassword },
  { path: '', redirectTo: '/api/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/api/home' }

];
