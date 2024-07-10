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
export class NotesavoirService {

  constructor(private http: HttpClient, private url:GlobalApiUrlService) { }
  REST_API = "http://localhost:3000";

  getNiveau(){
    var API_URL = this.url.REST_API+'/get-niveau';
    return this.http.get(API_URL, {})
  }  
  
  getProcessus(){
    var API_URL = this.url.REST_API+'/get-processus';
    return this.http.get(API_URL, {})
  }
  
  getInfo(matricule:any){
    var API_URL = this.url.REST_API+'/get-information';
    return this.http.post(API_URL, {matricule}, httpOptions)
  }

  getPosteFonction(data:any){
    var API_URL = this.url.REST_API+'/get-poste-fonction';
    return this.http.post(API_URL, {data}, httpOptions)
  }

  getAllCategorie(){
    var API_URL = this.url.REST_API+'/get-all-categorie';
    return this.http.get(API_URL, {})
  }

  saveSavoir(data:any){
    var API_URL = this.url.REST_API+'/save-savoir';
    return this.http.post(API_URL, {data}, httpOptions)
  }
  
  getSavoir(data:any){
    var API_URL = this.url.REST_API+'/get-savoir-personnel';
    return this.http.post(API_URL, {data}, httpOptions)
  }  

  getPersonnel(data){
    var API_URL = this.url.REST_API+'/get-liste-personnel';
    return this.http.post(API_URL, {data}, httpOptions)
  }

  getInformationWithCategorie(data:any){
    var API_URL = this.url.REST_API+'/get-information_savoir_categorie';
    return this.http.post(API_URL, {data}, httpOptions)
  }

}
