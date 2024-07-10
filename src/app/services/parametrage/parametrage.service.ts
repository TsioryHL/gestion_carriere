import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalApiUrlService } from '../global-api-url.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class ParametrageService {

  constructor(private http: HttpClient, private url:GlobalApiUrlService) { }
  REST_API = "http://localhost:3000";

  getProcessus(){
    var API_URL = this.url.REST_API+'/get-processus';
    return this.http.get(API_URL, {})
  }  

  getFonction(){
    var API_URL = this.url.REST_API+'/get-fonction';
    return this.http.get(API_URL, {})
  }  

  updateProcessusPoste(data:any){
    var API_URL = this.url.REST_API+'/update-processus-poste';
    return this.http.post(API_URL, {data}, httpOptions)
  }

  savereferentielCategorie(data:any){
    var API_URL = this.url.REST_API+'/save-referentiel-categorie';
    return this.http.post(API_URL, {data}, httpOptions)
  }

  recuperationRef(fonction:any){
    var API_URL = this.url.REST_API+'/recup-referentiel';
    return this.http.post(API_URL, {fonction}, httpOptions)
  }

  recuperationRefCategorie(fonction:any){
    var API_URL = this.url.REST_API+'/recup-referentiel-categorie';
    return this.http.post(API_URL, {fonction}, httpOptions)
  }

  saveNiveau(data:any){
    var API_URL = this.url.REST_API+'/save-niveau';
    return this.http.post(API_URL, {data}, httpOptions)
  }

  getAllNiveu(){
    var API_URL = this.url.REST_API+'/get-niveau';
    return this.http.get(API_URL, {})
  }

  deleteCategorie(num_categories: number[]){
    var API_URL = this.url.REST_API+'/delete-categorie';
    return this.http.post(API_URL, {num_categories}, httpOptions)
  }

}
