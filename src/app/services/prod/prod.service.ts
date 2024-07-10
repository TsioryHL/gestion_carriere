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
export class ProdService {

  constructor(private http: HttpClient, private url:GlobalApiUrlService) { }
  REST_API = "http://localhost:3000";

  getSavoirFaire(data:any){
    var API_URL = this.url.REST_API+'/get-savoirfaire-prod';
    return this.http.post(API_URL, {data}, httpOptions)
  }

  getPointage(data:any){
    var API_URL = this.url.REST_API+'/get-savoirfaire-pointage';
    return this.http.post(API_URL, {data}, httpOptions)
  }

  getListeProd(data:any){
    var API_URL = this.url.REST_API+'/get-liste_prod';
    return this.http.post(API_URL, {data}, httpOptions)
  }

  saveListPod(data:any){
    var API_URL = this.url.REST_API+'/save-liste_prod';
    return this.http.post(API_URL, {data}, httpOptions)
  }

  getSituationProd(){
    var API_URL = this.url.REST_API+'/get-situation_prod';
    return this.http.get(API_URL, {})
  }

  getObjectifCadence(){
    var API_URL = this.url.REST_API+'/get-objectif-cadence';
    return this.http.get(API_URL, {})
  }


}
