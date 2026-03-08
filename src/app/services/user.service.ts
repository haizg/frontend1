import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


@Injectable({providedIn:'root'})
export class UserService{
  private currentUser =new BehaviorSubject<any>(null);
  currentUser$=this.currentUser.asObservable();

  setUser(user:any){
    this.currentUser.next(user);
  }

  clearUser(){
    this.currentUser.next(null);
  }

  getUser(){
    return this.currentUser.getValue();
  }

}
