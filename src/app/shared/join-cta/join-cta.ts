import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangService } from '../../services/lang.service';
@Component({
  selector: 'app-join-cta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './join-cta.html',
  styleUrl: './join-cta.css',
  providers: [LangService],
})
export class JoinCta {
  constructor(public lang: LangService){}
}
