import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastService } from '../services/toast/toast.service';
import { MenuService } from '../services/menu/menu.service';
import { CryptageService } from '../services/cryptage/cryptage.service';

@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html',
  styleUrls: ['./accueil.component.css']
})
export class AccueilComponent implements OnInit {
  
  constructor(private router:Router, private cookies:CookieService, private toast:ToastService, private menuService:MenuService, private cryptageService:CryptageService) { 
    sessionStorage.setItem('currentUrl', this.cryptageService.encryptValue(this.router.url)) 
  }

  cookie:any = JSON.parse(this.cryptageService.decryptValue(this.cookies.get("data_utilisateur")))
  role:any = this.cookie.role

  navigate(path: string) {
    const restrictedPaths = ['/savoiretre', '/prod', '/cadre'];
    if (restrictedPaths.includes(path) && this.role === 'Utilisateur') {
      this.toast.Error("Accès réfusé");
      return;
    } else if(path.includes('/savoiretre') && this.role === 'Manager'){
      this.toast.Error("Accès réfusé");
      return;
    }
    this.router.navigate([path]);
  }

  ngOnInit(): void {  
      const target = document.getElementById('typed-text');
      const text = 'Gestion des carrières';
      let index = 0;
    
      function typeText() {
        if (index < text.length) {
          target.innerHTML += text.charAt(index);
          index++;
          setTimeout(typeText, 150); 
        } else {
          setTimeout(() => {
            target.innerHTML = ''; 
            index = 0; 
            typeText(); 
          }, 2000); 
        }
      }
      typeText(); 
}

}
