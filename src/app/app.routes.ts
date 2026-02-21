import { Routes } from '@angular/router';
import {Login} from './login/login';
import {Home} from './home/home';


export const routes: Routes = [
  {path:'api/login', component:Login},
  {path:'api/home',component: Home},

];
