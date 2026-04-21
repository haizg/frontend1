import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateLangService } from '../services/translate-lang.service';
import { Footer } from '../shared/footer/footer';

@Component({
  selector: 'app-about',
  imports: [CommonModule, RouterModule, Navbar, TranslateModule, Footer],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
    constructor(
      private translateLang: TranslateLangService
    ) {}

}
