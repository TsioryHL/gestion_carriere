import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastService } from '../services/toast/toast.service';
import { DateTimeService } from '../services/date-time/date-time.service';
import { ProdService } from '../services/prod/prod.service';
import { math } from '@amcharts/amcharts5';
import { CryptageService } from '../services/cryptage/cryptage.service';

@Component({
selector: 'app-prod',
templateUrl: './prod.component.html',
styleUrls: ['./prod.component.css']
})
export class ProdComponent implements OnInit {

constructor(private cdr : ChangeDetectorRef, private router:Router, private cookies:CookieService, private toast:ToastService, private datetimeservice : DateTimeService, private prodservice : ProdService, private cryptageService:CryptageService) { 
  sessionStorage.setItem('currentUrl', this.cryptageService.encryptValue(this.router.url))
}

dateFull:any
monthNameCapitalized:any
mois:any=[]
date_debut:any
date_fin:any
moisEntre:any=[]
moisAnnee:any=0
annee:any
matricule_resp:any = this.cryptageService.decryptValue(this.cookies.get("matricule")) || ""
data_savoir_faire_prod:any=[]
data_savoir_faire_prod_filter:any=[]
note_savoir_faire_cadence:any=0
note_savoir_faire_qualite:any=0
note_savoir_faire_polyvalence:any=0
cookie:any = JSON.parse(this.cryptageService.decryptValue(this.cookies.get("data_utilisateur")))
role:any = this.cookie.role

ngOnInit(): void {
  this.getDateTime()
  this.getListeProd()
  this.getSituationProd()
  this.getObjectifcadence()
}

getDateTime() {
  this.datetimeservice.getDateTime().subscribe(
    data => {
      let currentDate = new Date(data[0].now);
      let currentYear = currentDate.getFullYear();
      let currentMonth = currentDate.getMonth() + 1;
      let formattedMonth = currentMonth.toString().padStart(2,'0');
      this.date_fin = `${currentYear}-${formattedMonth}`
    }
  );
}

extraireDate() {
  this.moisEntre = []
  let dateActuelle = new Date(this.date_debut);
  let dateFinale = new Date(this.date_fin);
  while(dateActuelle <= dateFinale){
    const mois = dateActuelle.getMonth() + 1;
    const annee = dateActuelle.getFullYear();
    this.moisEntre.push({mois, annee})
    dateActuelle.setMonth(dateActuelle.getMonth()+1);
  }
}

lignes_production:any
ligne_filtre:any
status_responsable:any
processus_filtre:any
liste_personnel_dynamique: any[] = [];
liste_personnel_statique:any
liste_matricule_filtrable:any
getListeProd() {
  const dataObj = { matricule: this.matricule_resp, role: this.role };
  console.log(dataObj);
  this.prodservice.getListeProd(dataObj).subscribe(
    (data:any) => {
      if (data && data.length >= 3) {
        this.lignes_production = data[1];
        this.ligne_filtre = this.lignes_production.length === 1 ? this.lignes_production[0].id_ligne : "";
        const info_personnel = data[2] && data[2].length > 1 ? data[2][1] : null;
        if (info_personnel && info_personnel.responsable_processus && this.role === "Utilisateur") {
          this.status_responsable = true;
          if (data[2][0] && data[2][0].num_processus !== undefined) {this.processus_filtre = data[2][0].num_processus;}
        }
        this.liste_personnel_dynamique = data;
        this.liste_personnel_statique = data;
        this.liste_matricule_filtrable = this.liste_personnel_statique;
        this.getSituationProd()
      }
    },
  );
}
info_personnel:any=[]
getPersonnel_U(matricule, libelle_processus, ligne_defaut, lib_ligne, nom, prenoms, nom_poste, button_active){
  button_active = true;
  this.info_personnel = [{libelle_processus : libelle_processus, ligne_defaut : ligne_defaut, lib_ligne : lib_ligne, nom : nom, prenoms : prenoms, nom_poste : nom_poste, date_debut : this.date_debut, date_fin : this.date_fin}]
  var dataObj = {
    matricule: matricule, 
    info_personnel : JSON.stringify(this.info_personnel),
    button_active: button_active
  }
  console.log(dataObj);
  this.prodservice.saveListPod(dataObj).subscribe(
    data => {
      this.liste_personnel_dynamique.forEach(item => {item.situation = 'O'})
      this.toast.Success("Personnel configuré O");
      this.getSituationProd();
    }
  );
}

getSituationProd() {
  this.prodservice.getSituationProd().subscribe(
    (data: any) => {
      if (this.liste_personnel_dynamique && this.liste_personnel_dynamique.length > 0) {
        const filteredData = data.filter(d => this.liste_personnel_dynamique.some(item => item.matricule === d.matricule));
        filteredData.forEach(match => {
            const item = this.liste_personnel_dynamique.find(i => i.matricule === match.matricule);
            if (item) {item.button_active = match.button_active;}
        });
      }
    }
  );
}

objectif_cadence:any
getObjectifcadence(){
  this.prodservice.getObjectifCadence().subscribe(
    data => {
      this.objectif_cadence = data;
    }
  )
}

matricule_filtre_field:any
filtreByMatricule(matricule: any) {
  if (matricule) {this.liste_personnel_dynamique = this.liste_matricule_filtrable.filter(t => t.matricule.includes(matricule))} 
  else {this.liste_personnel_dynamique = [...this.liste_matricule_filtrable]}
}

getOrder(situation: any) {
  const order = { 'I': 1, 'L': 2, 'U': 3, 'O': 4 };
  return order[situation] || 999;
}

matricule:any
data_pointage:any
getSavoirFaireProd() {
  if (!this.matricule || !this.date_debut || !this.date_fin) {
    this.toast.Warning("Veuillez remplir tous les champs");
    return;
  }
  this.extraireDate()
  this.getObjectifcadence()
  var dataObj = {
    matricule: this.matricule,
    date : this.moisEntre
  };
  this.prodservice.getSavoirFaire(dataObj).subscribe((data:any) => {
    this.data_savoir_faire_prod = data;
    this.data_savoir_faire_prod_filter = data.filter(item => item.cadence_objectif !== 0 && item.cadence_atteinte !== 0);
    let sommeEvaluationCadence = 0;
    let sommeEvaluationQualite = 0;
    this.data_savoir_faire_prod_filter.forEach(item => {
      item.taux_atteinte_cadence = (item.cadence_objectif === 0 || item.cadence_atteinte === 0) ? "" : Math.round((item.cadence_atteinte / item.cadence_objectif) * 100);
      item.evaluation_cadence = item.taux_atteinte_cadence === "" ? 0 : item.taux_atteinte_cadence >= 200 ? 5 : item.taux_atteinte_cadence < 100 ? 0 : ((item.taux_atteinte_cadence * 5) / 200);
      sommeEvaluationCadence += item.evaluation_cadence;
      item.taux_atteinte_qualite = Math.round((1 - item.qualite_atteinte) / (1 - item.qualite_objectif)*100);
      item.evaluation_qualite = item.taux_atteinte_qualite >= 200 ? 5 : item.taux_atteinte_qualite < 100 ? 0 : ((item.taux_atteinte_qualite * 5) / 200);
      sommeEvaluationQualite += item.evaluation_qualite;
    });
    this.note_savoir_faire_cadence = this.data_savoir_faire_prod_filter.length > 0 ? Math.round((sommeEvaluationCadence / this.data_savoir_faire_prod_filter.length)*100)/100 : 0;
    this.note_savoir_faire_qualite = this.data_savoir_faire_prod_filter.length > 0 ? Math.round((sommeEvaluationQualite / this.data_savoir_faire_prod_filter.length)*100)/100 : 0;
    let seen = new Set();
    this.data_savoir_faire_prod = this.data_savoir_faire_prod.filter(item => {
      if (item.id_operation === '8100') {
        item.situation = 'I';
        item.isBelowNhac = false;
        return true;
      }
      const hasMatchingCadence = this.objectif_cadence.some(t => t.id_plan == item.id_plan && t.id_operation == item.id_operation && t.nhac != 0);
      if (hasMatchingCadence) {
        this.objectif_cadence.forEach(t => {
          if (t.id_plan == item.id_plan && t.id_operation == item.id_operation) {
              if (item.heure_effectue < t.nhac) {
                  item.situation = 'I';
                  item.isBelowNhac = true;
              } 
              if (item.heure_effectue > t.nhac && item.id_operation != '8100') {item.situation = 'L'} 
              if (item.heure_effectue > t.nhac && item.id_operation != '8100' && item.taux_atteinte_qualite >= 100 && item.taux_atteinte_cadence >= 100) {item.situation = 'U'};
          }
        });
      }
      return hasMatchingCadence || item.id_operation === '8100';
    });
    let situationsByMatricule = {};
    this.data_savoir_faire_prod.forEach(item => {
      if (!situationsByMatricule[item.matricule]) {situationsByMatricule[item.matricule] = []};
      situationsByMatricule[item.matricule].push(item.situation);
    });
    this.liste_personnel_dynamique.forEach(personnel => {
      if (situationsByMatricule[personnel.matricule]) {
        let sortedSituations = situationsByMatricule[personnel.matricule].sort((a, b) => this.getOrder(a) - this.getOrder(b));
        personnel.situation = sortedSituations[sortedSituations.length - 1];
      }
    });
    let etape_traite = this.data_savoir_faire_prod.length
    let etape_maitrise = this.data_savoir_faire_prod.filter(item => item.situation === 'U').length;
    let taux_maitrise = Math.round((etape_maitrise / etape_traite) * 100)
    this.note_savoir_faire_polyvalence = taux_maitrise >= 50 ? 5 : Math.round(taux_maitrise * 5) / 50
    this.matricule_filtre_field = this.matricule;
    this.filtreByMatricule(this.matricule_filtre_field);
  })
};


}