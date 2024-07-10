import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastService } from '../services/toast/toast.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ParametrageService } from '../services/parametrage/parametrage.service';
import { CryptageService } from '../services/cryptage/cryptage.service';

@Component({
  selector: 'app-poste',
  templateUrl: './poste.component.html',
  styleUrls: ['./poste.component.css']
})
export class PosteComponent implements OnInit {

  constructor(private router:Router, private cookies:CookieService, private toast:ToastService, private parametrageService:ParametrageService, private cryptageService:CryptageService) {
    sessionStorage.setItem('currentUrl', this.cryptageService.encryptValue(this.router.url))
  }

  all_poste:any
  processus:any
  containers: any[][] = [];
  
  ngOnInit(): void {
    this.getPoste()
  }

  getPoste() {
    this.parametrageService.getFonction().subscribe(
      data => {this.all_poste = data}, error => {}, () => {
        this.processus = this.groupBy(this.all_poste,"processus")
        this.containers = Array.from({ length: 8 }, (_, i) => this.processus[i] || []);
      }
    )
  }

  groupBy = (array, key) => {
    return array.reduce((result, currentItem) => {      
      const keyValue = currentItem[key];
      if (!result[keyValue]) {
        result[keyValue] = [];
      }
      result[keyValue].push(currentItem);
      return result;
    }, {});
  };

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }    
  }

  enregistrer(){
    console.log(this.containers)
    this.parametrageService.updateProcessusPoste(this.containers).subscribe(data => {
      this.toast.Success("Donnée enregistrée")
    })
  }

  test(data:any){
    console.log(data)
  }

}
