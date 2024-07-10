import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastService } from '../services/toast/toast.service';
import { ParametrageService } from '../services/parametrage/parametrage.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DateTimeService } from '../services/date-time/date-time.service';
import Swal from 'sweetalert2';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CryptageService } from '../services/cryptage/cryptage.service';
import { findIndex, indexOf } from '@amcharts/amcharts5/.internal/core/util/Array';

@Component({
  selector: 'app-parametrage',
  templateUrl: './parametrage.component.html',
  styleUrls: ['./parametrage.component.css']
})
export class ParametrageComponent implements OnInit {

  constructor(private router:Router, private cookies:CookieService, private toast:ToastService, private paramservice : ParametrageService, private datetimeservice : DateTimeService, private cryptageService:CryptageService) { 
    sessionStorage.setItem('currentUrl', this.cryptageService.encryptValue(this.router.url))
  }

  referentiel:any = []
  liste_niveau : any = []
  objet:any = {ref:"",niv_requis:"",niv_acceptable:"", nom_categorie:""}
  
  liste_processus:any
  processus:any = 0
  liste_fonction_dynamique:any
  liste_fonction_statique:any
  fonction:any = 0
  datenow:any
  matricule:any = this.cryptageService.decryptValue(this.cookies.get("matricule"))
  num_poste:any
  
  erreurProcessus = false;
  erreurFonction = false;
  erreurMatricule = false;
  
  valeur_copier:any = []
  disable_button_copier:any = true
  disable_button_coller:any = true
  
  niveau_categorie:any =[] = [{libelle_niveau : ''}]
  nom_categorie:any
  niveau:any
  all_niveau:any
  liste_niveau_categorie:any=[]
  nouveauListeNiveau:any=[]
  num_categorie:any=[]

  titre_categorie:any
  type_categorie:any
  referentiel_categorie:any=[]
  description_categorie:any
  showToast = {};

  toggleToast(index: number) {
    if (typeof this.showToast !== 'object') {
      this.showToast = {};
    }
    this.showToast[index] = !this.showToast[index];
  }

  //show
  // ngOnInit(): void {
  //   this.getAllNiveau()
  //   this.addReferentiel();
  //   this.recupProcessus()
  //   this.recupFonction()
  //   this.addNewCategorie()
  //   this.dateTime()
  // }

  ngOnInit(): void {
    this.initReferentielCategorie();
    this.getAllNiveau();
    this.recupProcessus();
    this.recupFonction();
    this.dateTime();
  }

  initReferentielCategorie() {
    this.referentiel_categorie = [{
      titre_categorie: "",
      description_categorie:"",
      referentiel: [{
        ref: "",
        niv_requis: "",
        niv_acceptable: "",
        nom_categorie: "",
        liste_niveau_categorie: []
      }]
    }];
  }

  addNiveauCategorie(){
    this.niveau_categorie.push({libelle_niveau : ''});
  }

  supprimerNiveauCategorie(index: number) {
    if (this.niveau_categorie.length > 1) {
      this.niveau_categorie.splice(index, 1);
    } else {
      this.niveau_categorie = [{libelle_niveau : ''}]
    }
  }
  
  getAllNiveau(){
    this.paramservice.getAllNiveu().subscribe(
      (data:any) => {
        this.all_niveau = data.map(item => ({...item, niveau: JSON.parse(item.niveau)}));
        // console.log(this.all_niveau);
        this.num_categorie = this.all_niveau.map(item => item.num_categorie)
        this.nouveauListeNiveau = [...this.all_niveau];
      }
    );
  }

  deleteCategorie(index: number){
    this.all_niveau[index].isDeleted = true;
    this.nouveauListeNiveau = this.all_niveau.filter(categorie => !categorie.isDeleted);
}
  
  addNiveau(categorie: any){
    categorie.niveau.push({libelle_niveau:''})
  }
  
  deleteNiveau(categorie: any, index: number){
    categorie.niveau.splice(index,1)
  }  

  resetData(){
    this.nom_categorie = "";
    this.niveau_categorie = [{libelle_niveau : ''}]
    this.referentiel.forEach(item => item.nom_categorie = "")
  }

  saveNiveau(){
    for(const item of this.niveau_categorie){
      if(!this.nom_categorie || !item.niveau || !item.libelle_niveau){
        this.toast.Error("Veuillez remplir tous les champs")
        return
      }
    }
    const data = {
      nom_categorie : this.nom_categorie,
      niveau : JSON.stringify(this.niveau_categorie)
    }
    this.paramservice.saveNiveau(data).subscribe(
      item => {
        this.toast.Success("Données envoyées")
        this.nom_categorie = ""
        this.getAllNiveau()
      }
    )
    this.resetData()
  }

  updateNiveau() {
    const toDelete = this.all_niveau.filter(categorie => categorie.isDeleted).map(c => c.num_categorie);
    const toUpdate = this.all_niveau.filter(categorie => !categorie.isDeleted);
    // console.log(toDelete)
    if (toDelete.length > 0) {
      this.paramservice.deleteCategorie(toDelete).subscribe(response => {
        this.all_niveau = this.all_niveau.filter(categorie => !categorie.isDeleted);
      });
    }
    toUpdate.forEach((categorie, index) => {
      const data = {
        nom_categorie: categorie.categorie,
        num_categorie: this.num_categorie[index],
        niveau: JSON.stringify(categorie.niveau)
      };
      this.paramservice.saveNiveau(data).subscribe(item => {
        this.toast.Warning("Données modifiées");
        this.referentiel.forEach(item => item.nom_categorie = "")
      });
    });
  }
  
  onCategorieChange(item: any) {
    this.all_niveau.forEach(niveau => {
      if(niveau.categorie == item.nom_categorie){
        this.liste_niveau_categorie = niveau.niveau;
      }
    });
  }

  changeNiveau(all_categorie:any,item, index) {
    const niveaux = this.all_niveau.filter(t => t.categorie === item.nom_categorie)[0]?.niveau || [];
    all_categorie.referentiel[index].liste_niveau_categorie = niveaux;
    all_categorie.referentiel[index].niv_requis = ""
    all_categorie.referentiel[index].niv_acceptable = ""
  }

  addNewCategorie() {
    const nouvelleCategorie = {
      titre_categorie: "",
      description_categorie: "",
      referentiel: [{
        ref: "",
        nom_categorie: "",
        niv_requis: "",
        niv_acceptable:"",
        liste_niveau_categorie: []
      }]
    };
    this.referentiel_categorie.push(nouvelleCategorie);
  }
  
  deleteAllCategorie(index:number){
    if (index !==0) {
      this.referentiel_categorie.splice(index,1);
    } else {
      this.referentiel_categorie[0] = { titre_categorie:"", description_categorie:"", referentiel:[{}] } ;
    }
  }
  
  recupProcessus() {
    this.paramservice.getProcessus().subscribe(
      data => {
        this.liste_processus = data;
      }
    );
  }
  
  recupFonction() {
    this.paramservice.getFonction().subscribe(
      data => {
        this.liste_fonction_dynamique = data;
        this.liste_fonction_statique = data;
      }
    );
  } 

  changeFonction() {
    this.fonction = 0
    this.liste_fonction_dynamique = this.liste_fonction_statique.filter(t => parseInt(t.processus) === parseInt(this.processus));
  }

  // drop(event: CdkDragDrop<string[]>, all_categorie:any) {
  //   moveItemInArray(all_categorie.referentiel, event.previousIndex, event.currentIndex);
  // }

  drop(event: CdkDragDrop<any[]>, all_categorie:any): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(all_categorie.referentiel, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
                        event.container.data,
                        event.previousIndex,
                        event.currentIndex);
    }
  }
  
  get connectedDropListsIds(): string[] {
    return this.referentiel_categorie.map((_, index) => `categorieList${index}`);
  }
  
  resultatGetReferentiel:any = [];
  res_categorie_ref:any = [];
  
  handleFunctionChange() {
    this.getReferentiel();
    this.referentiel_categorie = [
      {
        titre_categorie: "",
        description_categorie: "",
        referentiel: [{
          ref: "",
          nom_categorie: "",
          niv_requis: "",
          niv_acceptable:"",
          liste_niveau_categorie: []
        }]
      }
    ]
  }
  
  getReferentiel() {
    this.paramservice.recuperationRef(this.fonction).subscribe(
      data => {
        this.resultatGetReferentiel = data;
        if (this.resultatGetReferentiel.length == 1) {
          this.referentiel_categorie.forEach(item => {
            item.referentiel = JSON.parse(data[0].referentiel_poste);
          });
          this.getReferentielCategorieConditionally();
        } else {
          console.log('Condition non attendue ou gestion d’erreur');
        }
        this.disable_button_copier = (this.resultatGetReferentiel.length > 0 || this.resultatGetReferentiel[0].referentiel || this.resultatGetReferentiel[0].referentiel.length > 0) ? false : true;
        this.disable_button_coller = this.valeur_copier.length > 0 ? false : true;
      }
    );
  }
  
  getReferentielCategorieConditionally() {
    if (this.resultatGetReferentiel.length > 0) {
      this.getReferentielCategorie();
    }
  }
  
  getReferentielCategorie(){
    this.paramservice.recuperationRefCategorie(this.fonction).subscribe(
      data => {
        this.res_categorie_ref = data;
        if (this.res_categorie_ref.length == 1) {
          this.referentiel_categorie = JSON.parse(data[0].referentiel_categorie);
        } else {
          console.log('Condition non attendue ou gestion d’erreur');
        }
      }
    );
  }  

  resetState(){
    this.processus=0,
    this.fonction=0,
    this.referentiel = []
    this.addNewCategorie()
    this.dateTime()
  }

  //delete 
  supprimerObjet(all_categorie: any, item: any) {
    const index = all_categorie.referentiel.findIndex((ref: any) => ref === item);
    if (index > 0) {
        all_categorie.referentiel.splice(index, 1);
    } else {
      all_categorie.referentiel[0] = {}
    }
  }
  
  dateTime(){
    this.datetimeservice.getDateTime().subscribe(
      data=> { 
        this.datenow = data[0].date_format 
      })
  }

  updateReferentielErrors() {
    this.referentiel_categorie.forEach(all_categorie => {
      const hasEmptyCategoryDetails = !all_categorie.titre_categorie || all_categorie.titre_categorie.trim() === '' ||
                                      !all_categorie.description_categorie || all_categorie.description_categorie.trim() === '';
      const hasEmptyReferentiel = all_categorie.referentiel.forEach(ref => {
        const refError = !ref.ref || ref.ref.trim() === '' ||
                         !ref.nom_categorie || ref.nom_categorie.trim() === '' ||
                         !ref.niv_requis || ref.niv_requis.trim() === '' ||
                         !ref.niv_acceptable || ref.niv_acceptable.trim() === '';
        ref.error = refError;
        return refError;
      });
      all_categorie.error = hasEmptyCategoryDetails || hasEmptyReferentiel;
    });
  }
  
    //add
  addReferentiel(all_categorie: any) {
    const nouveauReferentiel = {ref:"", nom_categorie:"", niv_requis:"", niv_aceptable:"", liste_niveau_categorie: []};
    all_categorie.referentiel.push(nouveauReferentiel);
  }
  
  saveref() {
  this.erreurFonction = !this.fonction || this.fonction.trim() === '';
  this.erreurProcessus = !this.processus || this.processus.trim() === '';
  this.updateReferentielErrors();
  const hasErrors = this.erreurFonction || this.erreurProcessus || this.referentiel_categorie.some(all_categorie => all_categorie.error);
  if (hasErrors) {
    this.toast.Error("Veuillez remplir tous les champs obligatoires avant de sauvegarder.");
    return;
  }
  const preparedReferentiel = this.referentiel_categorie.map(({error, ...item}) => ({...item, description_categorie: item.description_categorie}));
  const dataObj = {
    processus: this.processus,
    fonction: this.fonction,
    referentiel_categorie: JSON.stringify(preparedReferentiel),
    matricule: this.matricule,
  };
  this.paramservice.savereferentielCategorie(dataObj).subscribe(
    data => { 
      this.toast.Success("Données enregistrée") 
      this.getReferentielCategorie()
    }
  )
  }

  copier(){
    if (this.referentiel_categorie.length > 0) {
      this.valeur_copier = this.referentiel_categorie.map(item => ({
        referentiel: item.referentiel,
        titre_categorie: item.titre_categorie,
        description_categorie: item.description_categorie
      }));
      this.disable_button_coller = false;
      this.toast.Info("Données copiées");
    }
    console.log("Valeur à coller :", this.valeur_copier);
  }  

  coller(){
    const ref_categorie_verification = this.referentiel_categorie.some(item => item.referentiel !== '' || item.titre_categorie !== '' || item.description_categorie !== '');
    const coller_ref_categorie = () => {
      this.referentiel_categorie.forEach((item) => {
        if (this.valeur_copier) {
          item.referentiel = this.valeur_copier.forEach(item => {item.referentiel});
          item.titre_categorie = this.valeur_copier.forEach(item => {item.titre_categorie});
          item.description_categorie = this.valeur_copier.forEach(item=>{item.description_categorie});
        }
      });
      this.toast.Info("Données écrasées");
    };
  
    if (ref_categorie_verification) {
      Swal.fire({
        title: "Remplacer les données",
        text: "Voulez-vous écraser les référentiels, les titres et les descriptions ?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Oui, écraser",
        cancelButtonText: "Non",
      }).then((result) => {
        if (result.isConfirmed) {
          coller_ref_categorie();
        }
      });
    } else {
      coller_ref_categorie();
    }
  }  

}