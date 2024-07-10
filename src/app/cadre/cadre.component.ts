import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastService } from '../services/toast/toast.service';
import { ParametrageService } from '../services/parametrage/parametrage.service';
import { CryptageService } from '../services/cryptage/cryptage.service';

@Component({
  selector: 'app-cadre',
  templateUrl: './cadre.component.html',
  styleUrls: ['./cadre.component.css']
})
export class CadreComponent implements OnInit {

  constructor(private router:Router, private cookies:CookieService, private toast:ToastService, private paramservice : ParametrageService, private cryptageService:CryptageService) { 
    sessionStorage.setItem('currentUrl', this.cryptageService.encryptValue(this.router.url))
  }

  liste_processus:any
  processus:any

  recupProcessus() {
    this.paramservice.getProcessus().subscribe(
      data => {
        this.liste_processus = data;
      }
    );
  }

  ngOnInit(): void {
    this.recupProcessus()
  }
}
