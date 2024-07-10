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
export class SavoiretreService {

  constructor(private http: HttpClient, private url:GlobalApiUrlService) { }
  REST_API = "http://localhost:3000";

getPoint(){
  var API_URL = this.url.REST_API+'/get-point';
  return this.http.get(API_URL, {})
}

saveSavoiretre(data:any){
  var API_URL = this.url.REST_API+'/save-savoir_etre';
  return this.http.post(API_URL, {data}, httpOptions)
}

getListePersonnel(){
  var API_URL = this.url.REST_API+'/get-liste-personnel-savoir_etre';
  return this.http.get(API_URL, {})
}

getSyntheseSanction (data:any){
  var API_URL = this.url.REST_API+'/get-synthese-sanction';
  return this.http.post(API_URL, {data}, httpOptions)
}

getLigne(){
  var API_URL = this.url.REST_API+'/get-ligne-production';
  return this.http.get(API_URL, {})
}

}