import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangService } from '../../services/lang.service';
@Component({
  selector: 'app-join-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './join-cta.html',
  styleUrl: './join-cta.css',

})
export class JoinCta {
  constructor(public lang: LangService, private cdr: ChangeDetectorRef){}

  ngOnInit() {
      //this.lang.lang$.subscribe(() => {
        //this.cdr.detectChanges();
      //});
    }
}
