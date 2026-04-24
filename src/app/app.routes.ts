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
import { VerifyAccount } from './verify-account/verify-account';
import { AdminGuard } from './guards/admin.guard';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { About} from './about/about';
import {Contact} from './contact/contact';
import { OrganizerProfile } from './organizer-profile/organizer-profile';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'home', component: Home },
  { path: 'signuporg', component: SignUpOrg },
  { path: 'joinevent', component: Popup },
  { path: 'profile', component: Profile },
  { path: 'events', component: EventsPage },
  { path: 'events/:id', component: EventDetail },
  { path: 'confirm', component: Confirmation },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'verify-account', component: VerifyAccount },
  { path: 'reset-password', component: ResetPassword },
  { path: 'admin/dashboard', component: AdminDashboard, canActivate: [AdminGuard] },
  { path: 'organizer/:id', component: OrganizerProfile },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
