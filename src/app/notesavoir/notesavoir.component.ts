import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastService } from '../services/toast/toast.service';
import { NotesavoirService } from '../services/notesavoir/notesavoir.service';
import { DateTimeService } from '../services/date-time/date-time.service';
import { ParametrageService } from '../services/parametrage/parametrage.service';
import { isInteger } from '@ng-bootstrap/ng-bootstrap/util/util';
import Swal from 'sweetalert2';
import { SweetAlertOptions } from 'sweetalert2';
import { MenuService } from '../services/menu/menu.service';
import { CryptageService } from '../services/cryptage/cryptage.service';


@Component({
selector: 'app-notesavoir',
templateUrl: './notesavoir.component.html',
styleUrls: ['./notesavoir.component.css']
})
export class NotesavoirComponent implements OnInit {

constructor(private router:Router, private cookies:CookieService, private toast:ToastService, private noteservice: NotesavoirService, private datetimeservice : DateTimeService, private paramservice:ParametrageService, private menuService:MenuService, private cryptageService:CryptageService) { 
  sessionStorage.setItem('currentUrl', this.cryptageService.encryptValue(this.router.url))
}

cookie:any = JSON.parse(this.cryptageService.decryptValue(this.cookies.get("data_utilisateur")))
matricule:any = this.cryptageService.decryptValue(this.cookies.get("matricule"))
role:any = this.cookie.role
liste_niveau:any
niveau_poste:any
niveau_autres:any
processus:any
liste_processus:any
liste_processus_filtre_modal:any
nomprenom:any
fonction:any
nom_processus:any
nom_fonction:any
date_embauche:any
datenow:any
anciennete:any
referentiel_poste:any
total_note_actuel:any 
total_note_acceptable:any 
total_note_requis:any 
liste_fonction_dynamique:any
liste_fonction_statique:any
autre_savoir:any = []
proc_fonction:any=0
all_data_reference:any=[]
frequence_autre_savoir:any = 0
moyenne_requis:any = 0
moyenne_acceptable:any = 0
erreurNiveau:any
data_savoir:any = []
info_existe:any = false
liste_personnel_dynamique:any = []
liste_personnel_statique:any
lignes_production:any
processus_filtre:any = ""
ligne_filtre:any = ""
matricule_filtre_field:any = ""
liste_matricule_filtrable:any
nombre_savoir_configure:any = 0
mode_vue:any = false
status_responsable:any = false
titre_categorie:any=""
description_categorie:any

ngOnInit(): void {
  this.getListePersonnel()
  this.dateTime();
  this.recupProcessus();
  this.recupFonction();
  this.recupNiveau();
  this.getInfoWithCategorie(this.matricule)
  this.ajoutAutreSavoir()
};

getListePersonnel(){
  var dataObj = {matricule : this.matricule, role : this.role}
  this.nombre_savoir_configure = 0
  this.noteservice.getPersonnel(dataObj).subscribe(
    data => {
      this.lignes_production = data[1]
      this.ligne_filtre = this.lignes_production.length == 1 ? data[1][0].id_ligne : ""
      if(data[2][1].responsable_processus == true && this.role == "Utilisateur"){
        this.status_responsable = true
        this.processus_filtre = data[2][0].num_processus
      } 
      this.liste_personnel_dynamique = data[0]
      this.liste_personnel_statique = data[0]
      this.liste_matricule_filtrable = this.liste_personnel_statique
      this.countNombreSavoirConfigure()
    }
  )
}

filtreByMatricule(matricule:any){
  this.liste_personnel_dynamique = this.liste_matricule_filtrable.filter(t => t.matricule.includes(matricule))
  this.countNombreSavoirConfigure()
}

filtreByProcLigne(processus:any, ligne:any){
  if(ligne != "" && processus != ""){
    this.liste_personnel_dynamique = this.liste_personnel_statique.filter(t => t.num_processus == processus && t.ligne_defaut == ligne)
    this.liste_matricule_filtrable = this.liste_personnel_statique.filter(t => t.num_processus == processus && t.ligne_defaut == ligne)
    this.countNombreSavoirConfigure()
  } else if (ligne == "" && processus != "") {
    this.liste_personnel_dynamique = this.liste_personnel_statique.filter(t => t.num_processus == processus)
    this.liste_matricule_filtrable = this.liste_personnel_statique.filter(t => t.num_processus == processus)
    this.countNombreSavoirConfigure()
  }
}

voirInfoPersonnel(matricule:any){
  this.mode_vue = true;
  this.matricule = matricule
  this.getInfoWithCategorie(matricule)
}

resetInfoPersonnel(){
  this.mode_vue = false;
  this.matricule = this.cryptageService.decryptValue(this.cookies.get("matricule"))
  this.getInfoWithCategorie(this.matricule)
}

countNombreSavoirConfigure(){
  this.nombre_savoir_configure = 0
  this.liste_personnel_dynamique.forEach(item => {this.nombre_savoir_configure += item.status == 1 ? 1 : 0})
}

resetFiltre() {
  this.liste_personnel_dynamique = this.liste_personnel_statique;
  this.liste_matricule_filtrable = this.liste_personnel_statique;
  this.processus_filtre = this.status_responsable ? this.processus_filtre : ""
  this.ligne_filtre = this.lignes_production.length == 1 ? this.ligne_filtre : ""
  this.matricule_filtre_field = "";
  this.countNombreSavoirConfigure();
}

recupNiveau(){
  this.noteservice.getNiveau().subscribe(data => {this.liste_niveau = data})
}

recupProcessus() {
  this.noteservice.getProcessus().subscribe(
    data => {
      this.liste_processus = data;
      this.liste_processus.forEach (liste => {
        liste.disable = false
        liste.frequence = 0
      })
      this.liste_processus_filtre_modal = data
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

resetautressavoir(index:any, processus:any): void {
  this.autre_savoir[index] = {processus:"", titre_categorie:"", description_categorie:"", referentiel:[{ref:"", note:0, liste_niveau: []}], totale_note:0, liste_referentiel:[] };
  this.liste_processus.forEach(liste => {
    if(processus == liste.num_processus){liste.disable = false}
  })
}

calculateAnciennete(dateNow:any, dateEmbauche:any) {
    let diff = Math.abs(dateNow.getTime() - dateEmbauche.getTime());
    let months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44)); // 30.44 jours par mois en moyenne
    let years = Math.floor(months / 12);
    months = months % 12;
    return years + " ans " + months + " mois";
}  

referentiel_categorie:any=[]
getInfoWithCategorie(matricule:any){
  this.noteservice.getInfo(matricule).subscribe(
    data => {
      this.nomprenom = data[0].nom + " " + data[0].prenoms;
      this.fonction = data[0].fct;
      this.date_embauche = data[0].date_embauche;
      this.anciennete = this.calculateAnciennete(new Date(this.datenow), new Date(this.date_embauche))
    }, error => {},
    () => {
      var dataObj = {matricule:matricule, fonction:this.fonction}
      this.noteservice.getInformationWithCategorie(dataObj).subscribe(
        data => {
          console.log(data)
          this.info_existe = data[0].info_existe
          this.nom_processus = data[0].nom_processus
          this.nom_fonction = data[0].nom_fonction
          this.referentiel_categorie = data[0].referentiel_categorie
          this.autre_savoir = data[0].autre_savoir
          if(this.autre_savoir.length == 0) this.ajoutAutreSavoir()
          this.moyenne_requis = data[0].moyenne_requis
          this.moyenne_acceptable = data[0].moyenne_acceptable
          if(data[0].liste_processus.length != 0) this.liste_processus = data[0].liste_processus
          if(data[0].confirmedSelectedCategories.length != 0) this.confirmedSelectedCategories = data[0].confirmedSelectedCategories;
          this.getAllReferentielWithCategorie(0)
        }
      )
    }
  )
}

dateTime(){
  this.datetimeservice.getDateTime().subscribe(data=> { this.datenow = data[0].now });
}

ajoutAutreSavoir(){
  const objet_autre_savoir = {processus:"", titre_categorie:"", description_categorie:"", referentiel:[{ref:"", note:0, libelle_niveau:"", liste_niveau:[]}], frequence_savoir:0, liste_referentiel:[]}
  this.autre_savoir.push(objet_autre_savoir)
  this.lastSelectedCategory.forEach(cat => {if (cat && !this.confirmedSelectedCategories.includes(cat)) {this.confirmedSelectedCategories.push(cat);}});
  this.lastSelectedCategory = []; 
}

ajoutRefautresSavoir(index_parent:any){
  const nouveauReferentiel = { ref: "", libelle_niveau: "", liste_niveau: []};
  this.autre_savoir[index_parent].referentiel.push({...nouveauReferentiel});
  if (this.autre_savoir[index_parent].titre_categorie) {this.updateNiveau(this.autre_savoir[index_parent].titre_categorie, index_parent);}
}

supprimerObjet(index:any, processus:any) {
  if(this.autre_savoir.length > 1){
    this.autre_savoir.splice(index, 1)
  }
  this.liste_processus.forEach(liste => {
    if(processus == liste.num_processus){
      liste.disable = false
    }
  })
}

supprimerObjetReferentiel(index_parent:any, index_enfant:any){
  if(this.autre_savoir[index_parent].referentiel.length > 1){
    this.autre_savoir[index_parent].referentiel.splice(index_enfant,1)
  }
}

all_categorie:any = []
titre_categorie_sans_doublon:any=[]
selectedCategories = [];
getAllReferentielWithCategorie(currentIndex) {
  this.noteservice.getAllCategorie().subscribe(
    data => {
      this.all_categorie = data;
      this.all_categorie.forEach(item => {item.referentiel_categorie = JSON.parse(item.referentiel_categorie);});
    },
    error => {},
    () => {
      var categoriesMap = new Map();
      this.all_categorie.forEach(item => {
        item.referentiel_categorie.forEach(referentiel => {
          let existingEntry = categoriesMap.get(referentiel.titre_categorie);
          if (!existingEntry) {categoriesMap.set(referentiel.titre_categorie, { count: 1, processus: [item.processus] });} 
          else {
            existingEntry.count++;
            existingEntry.processus.push(item.processus);
            categoriesMap.set(referentiel.titre_categorie, existingEntry);
          }
        });
      });
      this.titre_categorie_sans_doublon = [];
      categoriesMap.forEach((value, key) => {
        if (value.count > 1) {
          let userProcessus = this.liste_processus.find(p => value.processus.includes(p.num_processus) && p.libelle_processus === this.nom_processus);
          this.titre_categorie_sans_doublon.push({ titre_categorie: key, processus: userProcessus ? userProcessus.num_processus : value.processus[0] });
        } else {this.titre_categorie_sans_doublon.push({ titre_categorie: key, processus: value.processus[0] });}
      });
    }
  );
}

lastSelectedCategory: any = []
confirmedSelectedCategories: any = []
onSelectCategory(titre_categorie, index) {
  this.lastSelectedCategory[index] = titre_categorie;
  this.allUpdate(titre_categorie, index);
}

isCategoryDisabled(categorie: string, currentIndex: number): boolean {
  return this.confirmedSelectedCategories.includes(categorie);
}

allUpdate(titre_categorie:any, index){
  this.updateDescription(index);
  this.updateNiveau(titre_categorie, index);
  this.updateProcessus(titre_categorie, index);
  this.updateReferentiel(titre_categorie, index)
}

updateProcessus(titre_categorie: any, index: number) {
  if (index >= 0 && this.autre_savoir && this.autre_savoir[index]) {
    if (!this.autre_savoir[index].processus) {this.autre_savoir[index].processus = "";}
    const categorieAssociee = this.titre_categorie_sans_doublon.find(item => item.titre_categorie === titre_categorie);
    if (categorieAssociee) {this.autre_savoir[index].processus = categorieAssociee.processus;}
    if (this.autre_savoir[index].processus) {
      const processusItem = this.liste_processus.find(item => item.num_processus === this.autre_savoir[index].processus);
      if (processusItem) {this.autre_savoir[index].processus = processusItem.libelle_processus;}
    }
  }
}

updateReferentiel(titre_categorie:any, index){
  if (index >= 0 && this.autre_savoir && this.autre_savoir[index] && this.autre_savoir[index].referentiel) {
    if (!this.autre_savoir[index].liste_referentiel) {this.autre_savoir[index].liste_referentiel= [];}
    const foundCategorie = this.all_categorie.find(categorie => categorie.referentiel_categorie.some(referentiel => referentiel.titre_categorie === titre_categorie));
    if (foundCategorie) {
        foundCategorie.referentiel_categorie.forEach(t => {if (t.titre_categorie === titre_categorie) {this.autre_savoir[index].liste_referentiel = t.referentiel}});
    }
  }
}

updateNiveau(titre_categorie:any, index){
  if (index >= 0 && this.autre_savoir && this.autre_savoir[index]) {
    const foundCategorie = this.all_categorie.find(categorie => categorie.referentiel_categorie.some(referentiel =>referentiel.titre_categorie === titre_categorie));
    if (foundCategorie) {
      let niveaux = [];
      foundCategorie.referentiel_categorie.forEach(t => {t.referentiel.forEach(i => {if (t.titre_categorie === titre_categorie) {niveaux.push(...i.liste_niveau_categorie);}});});
      const uniqueNiveaux = new Map();
      niveaux.forEach(niveau => {
        const key = `${niveau.libelle_niveau}-${niveau.niveau}`;
        if (!uniqueNiveaux.has(key)) {uniqueNiveaux.set(key, niveau);}
      });
      const niveauxUniques = Array.from(uniqueNiveaux.values());
      this.autre_savoir[index].referentiel.forEach(ref => {ref.liste_niveau = niveauxUniques;});
    }
  }
}

updateDescription(index: number) {
  const selectedCategorie = this.all_categorie.find(categorie => {
      return categorie.referentiel_categorie.some(rc => rc.titre_categorie === this.autre_savoir[index].titre_categorie);
  });
  if (selectedCategorie) {this.autre_savoir[index].description_categorie = selectedCategorie.referentiel_categorie.find(rc => rc.titre_categorie === this.autre_savoir[index].titre_categorie).description_categorie;}
}

cummulNote() {
  this.total_note_actuel = this.total_note_requis = this.total_note_acceptable = 0;
  this.referentiel_categorie.forEach(item => {
    this.total_note_actuel += +item.note_actuel;
    this.total_note_requis += +item.note_requis;
    this.total_note_acceptable += +item.note_acceptable;
  });
}

getNote(array_liste_niveau, type_niveau) {
  return array_liste_niveau.find(niveau => niveau.libelle_niveau === type_niveau)?.niveau;
}
  
saveSavoir(){
this.frequence_autre_savoir = 0
this.autre_savoir.forEach((savoir, index) => {
  this.autre_savoir[index].frequence_savoir = 0
  savoir.referentiel.forEach(ref => {
    ref.note = this.getNote(ref.liste_niveau, ref.libelle_niveau) == undefined ? 0 : this.getNote(ref.liste_niveau, ref.libelle_niveau)
    this.autre_savoir[index].frequence_savoir += ref.note >= 2 ? 1 : 0
  })
  this.frequence_autre_savoir += this.autre_savoir[index].frequence_savoir
})
this.referentiel_categorie.forEach((ref, index) => {
  ref.referentiel.forEach(item => {ref.note_actuel = this.getNote(item.liste_niveau_categorie, item.libelle_niveau) == undefined ? 0 : this.getNote(item.liste_niveau_categorie, item.libelle_niveau)})
  ref.referentiel.forEach(item => {ref.note_requis = this.getNote(item.liste_niveau_categorie, item.niv_requis) == undefined ? 0 : this.getNote(item.liste_niveau_categorie, item.niv_requis)})
  ref.referentiel.forEach(item => {ref.note_acceptable = this.getNote(item.liste_niveau_categorie, item.niv_acceptable) == undefined ? 0 : this.getNote(item.liste_niveau_categorie, item.niv_acceptable)})
})
this.cummulNote()
this.liste_processus.forEach(liste => {
  liste.frequence = 0
  this.autre_savoir.forEach(savoir => {
    if (savoir.processus === liste.libelle_processus) {
      liste.frequence += savoir.frequence_savoir === undefined ? 0 : savoir.frequence_savoir;
      if (liste.frequence > 5) {liste.frequence = 5;}
    }
  });
  });
  this.moyenne_requis = Math.round(((5*this.total_note_actuel)/this.total_note_requis)*100)/100 > 5 ? 5 : Math.round(((5*this.total_note_actuel)/this.total_note_requis)*100)/100
  this.moyenne_acceptable = Math.round(((5*this.total_note_actuel)/this.total_note_acceptable)*100)/100 > 5 ? 5 : Math.round(((5*this.total_note_actuel)/this.total_note_acceptable)*100)/100
  //titre_categorie_disable
  if (this.lastSelectedCategory.length > 0) {this.lastSelectedCategory.forEach((categorie, index) => {if (categorie && !this.confirmedSelectedCategories.includes(categorie)) {this.confirmedSelectedCategories.push(categorie);}});}
  //erreur savoir
  this.referentiel_categorie.forEach(item => { item.referentiel.forEach(ref => { ref.error = !ref.libelle_niveau || ref.libelle_niveau.trim() === '';});});
  const hasReferentielErrorNiveau = this.referentiel_categorie.some(item => item.referentiel && item.referentiel.some(ref => ref.error));    
  if (hasReferentielErrorNiveau) {
    this.toast.Warning("Niveau requis")
    return;
  }
  // erreur autre savoir
  var erreur_save_autre_savoir = false;
  this.autre_savoir.forEach((categorie, index) => {
    if (index != 0 && categorie.titre_categorie == "") {
      this.toast.Warning("Titre Categorie requis pour autre savoir " + (index + 1));
      erreur_save_autre_savoir = true;
    }
    categorie.referentiel.forEach((ref, ind) => {
      if (categorie.titre_categorie != "" && (!ref.ref || ref.ref == "" || !ref.libelle_niveau || ref.libelle_niveau  == "")) {
        this.toast.Warning("Référentiel " + (ind + 1) + " et niveau requis (autre savoir " + (index + 1) + ")");
        erreur_save_autre_savoir = true;
      } else if(index == 0 && categorie.titre_categorie != "" && (!ref.ref || ref.ref == "" || !ref.libelle_niveau || ref.libelle_niveau  == "")){
        this.toast.Warning("Référentiel " + (index + 1) + " et niveau requis (autre savoir " + (index + 1) + ")");
        erreur_save_autre_savoir = true; 
      }
    });
  });
  if (erreur_save_autre_savoir) return;
  var dataObj = {
    matricule: this.matricule,
    fullname: this.nomprenom,
    num_fonction: this.fonction,
    libelle_fonction: this.nom_fonction,
    anciennete : this.anciennete,
    libelle_processus : this.nom_processus,
    referentiel_categorie : JSON.stringify(this.referentiel_categorie),
    autre_savoir : JSON.stringify(this.autre_savoir),
    note_poste_requis : this.moyenne_requis,
    note_poste_acceptable : this.moyenne_acceptable,
    frequence_autre_savoir : this.frequence_autre_savoir,
    confirmedSelectedCategories: JSON.stringify(this.confirmedSelectedCategories),
    liste_frequence_autre_savoir : JSON.stringify(this.liste_processus)
  }
  console.log(dataObj)
  this.noteservice.saveSavoir(dataObj).subscribe(data => {
    const swalOptions = {
      position: 'center',
      icon: this.info_existe ? 'info' : 'success',
      title: this.info_existe ? 'Données modifiées' : 'Données enregistrées',
      showConfirmButton: false,
      timer: this.info_existe ? 800 : 1500
    };
    Swal.fire(swalOptions as SweetAlertOptions );
    if (!this.info_existe) this.getInfoWithCategorie(this.matricule);
  });
}

}
