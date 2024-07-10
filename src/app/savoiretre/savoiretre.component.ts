import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastService } from '../services/toast/toast.service';
import { ParametrageService } from '../services/parametrage/parametrage.service';
import { SavoiretreService } from '../services/savoiretre/savoiretre.service';
import { DateTimeService } from '../services/date-time/date-time.service';
import { CryptageService } from '../services/cryptage/cryptage.service';

@Component({
  selector: 'app-savoiretre',
  templateUrl: './savoiretre.component.html',
  styleUrls: ['./savoiretre.component.css']
})
export class SavoiretreComponent implements OnInit {

  constructor(private router:Router, private cookies:CookieService, private toast:ToastService, private paramservice : ParametrageService, private savoiretreService : SavoiretreService, private dateTimeService: DateTimeService, private cryptageService:CryptageService) { 
    sessionStorage.setItem('currentUrl', this.cryptageService.encryptValue(this.router.url))
  }
  
liste_personnel_dynamique:any=[]
liste_processus:any
processus:any=""
liste_point_dynamique :any[]
liste_personnel_paginee:any[]
currentPage:number=1
itemsPerPage:number=18
totalItems:number=0
totalPages:number=0
liste_point:any
liste_matricule_filtrable:any
liste_personnel_statique:any=[]
matricule_filtre:any=""
ligne_filtre:any = ""
lignes_production:any
matricule:any
liste_retard:any
nombre_retard:any
matricule_retard:any
liste_absence:any
liste_avertissement_verbal:any
liste_avertissement_ecrit:any
note_personnel:any
nombre_savoir_etre_definis:any=0
nomprenom:any
num_fonction:any
data_savoir_etre:any=[]
savoir_etre_matricule_existe:any=false;
date_debut:any
date_fin:any
liste_retard_exacte:any
liste_absence_exacte:any
liste_avertissement_verbal_exacte:any
liste_avertissement_ecrit_exacte:any

ngOnInit(): void {
  this.datedefaut();
  this.calculNoteProduction()
  this.getPointSavoir()
  this.recupProcessus();
  this.getListePersonnel();
  this.getLigneProduction();
}

recupProcessus() {
  this.paramservice.getProcessus().subscribe(
    data => {
      this.liste_processus = data;
    }
  );
}

getLigneProduction(){
    this.savoiretreService.getLigne().subscribe(
      data => {
        this.lignes_production = data
      }
    )
}

onChangeProcessus() {
  this.ligne_filtre = '';
  this.filtreByProcLigne(this.processus, this.ligne_filtre);
}

resetFiltre(){
  this.liste_personnel_dynamique = this.liste_personnel_statique
  this.liste_matricule_filtrable = this.liste_personnel_statique
  this.processus = ""
  this.ligne_filtre = ""
  this.matricule_filtre = ""
  // this.calculerNombreSavoirEtreDefinis();
  this.miseAJourPaginationApresFiltrage()
}

resetAllSelected() {
  this.liste_personnel_dynamique.forEach(item => {
    item.pointcommuniquer = [];
    item.pointcooperer = []; 
    item.pointproposer = [];
    item.pointorganiser = [];
    item.pointdisponibilite = [];
    item.pointmotivation = [];
    // this.calculerNombreSavoirEtreDefinis();
  });
}

getPointSavoir(){
  this.savoiretreService.getPoint().subscribe(data => {this.liste_point = data;})
}

datedefaut(){
  this.dateTimeService.getDateTime().subscribe(
    data => {
      let aujourdHui = new Date(data[0].date_format);
      let premierJour =  new Date(aujourdHui.getFullYear(), aujourdHui.getMonth(), 1).toLocaleDateString().split('/')
      let dernierJour  =  new Date(aujourdHui.getFullYear(), aujourdHui.getMonth() + 1, 0).toLocaleDateString().split('/')
      this.date_debut = premierJour[2]+"-"+premierJour[1]+"-"+premierJour[0];
      this.date_fin = dernierJour[2]+"-"+dernierJour[1]+"-"+dernierJour[0];
    }
  )
}

getListePersonnel(){
  const date = {
    date_debut : this.date_debut,
    date_fin : this.date_fin
  }
  // console.log(date)
  // return
  this.savoiretreService.getSyntheseSanction(date).subscribe(
    data => {
      // console.log(data)
      this.liste_personnel_dynamique = data;
      this.liste_personnel_statique = data;
      this.liste_matricule_filtrable = data;
      // this.calculerNombreSavoirEtreDefinis()
    } , error => {}, () => {
      this.totalItems = this.liste_personnel_dynamique.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.setPage(this.currentPage);
      this.liste_personnel_dynamique.forEach(personnel => {
        var communiquer = 0;
        var cooperer = 0;
        var creer = 0;
        var organiser = 0;
        var disponibilite = 0;
        var motivation = 0;
        if (personnel.id_type_prod == 'I' && personnel.data_formulaire.length != 0) {
            const { capaciteMiseEnOeuvrePoste, bilanactiviteprofessionnelle } = personnel.data_formulaire;
            if (capaciteMiseEnOeuvrePoste) {
                for (var i = 0; i < 16; i++) {
                    capaciteMiseEnOeuvrePoste["trois_q" + (i + 1)].choices.forEach(item => {
                        if (item.selectionne) {
                            const value = parseFloat(item.value);
                            if (i < 4) communiquer += value;
                            else if (i < 7) cooperer += value;
                            else if (i < 10) creer += value;
                            else organiser += value;
                        }
                    });
                }
            }
            if (bilanactiviteprofessionnelle) {
                for (var i = 0; i < 3; i++) {
                    bilanactiviteprofessionnelle["quatre_q" + (i + 1)].choices.forEach(item => {
                        if (item.selectionne) {
                            const value = parseFloat(item.value);
                            if (i < 2) disponibilite += value;
                            else motivation += value;
                        }
                    });
                }
            }
            personnel.pointcommuniquer = Math.round(communiquer)
            personnel.pointcooperer = Math.round(cooperer)
            personnel.pointproposer = Math.round(creer)
            personnel.pointorganiser = Math.round(organiser)
            personnel.pointdisponibilite = Math.round(disponibilite)
            personnel.pointmotivation = Math.round(motivation)

            let totalPoints = personnel.pointcommuniquer + personnel.pointcooperer + personnel.pointorganiser + personnel.pointdisponibilite + personnel.pointmotivation
            personnel.sommePoints = totalPoints /6;
            personnel.note_savoir_etre = personnel.sommePoints > 5 ? 5 : Math.round(personnel.sommePoints * 100) / 100;
        }        
        // Initialisation des valeurs à 0
        personnel.retard_bonus = personnel.retard_malus = personnel.absence_bonus = personnel.absence_malus = 0;
        personnel.avertissement_verbal_bonus = personnel.avertissement_verbal_malus = 0;
        personnel.avertissement_ecrit_bonus = personnel.avertissement_ecrit_malus = 0;
        // Calcul des bonus et malus pour retards
        personnel.retard_bonus = personnel.nombre_retards_exacte === 0 ? 5 : 0;
        personnel.retard_malus = personnel.nombre_retards_exacte >= 20 ? -5 : Math.round((personnel.nombre_retards_exacte * (-5) / 20) * 100) / 100;
        // Calcul des bonus et malus pour absences
        personnel.absence_bonus = personnel.nombre_absences_exacte === 0 ? 5 : 0;
        personnel.absence_malus = personnel.nombre_absences_exacte >= 2 ? -5 : Math.round((personnel.nombre_absences_exacte * (-5) / 2) * 100) / 100;
        // Calcul des bonus et malus pour avertissements verbaux
        personnel.avertissement_verbal_bonus = personnel.nombre_avertissement_verbal_exacte === 0 ? 5 : 0;
        personnel.avertissement_verbal_malus = personnel.nombre_avertissement_verbal_exacte >= 2 ? -5 : Math.round((personnel.nombre_avertissement_verbal_exacte * (-5) / 2) * 100) / 100;
        // Calcul des bonus et malus pour avertissements écrits
        personnel.avertissement_ecrit_bonus = personnel.nombre_avertissement_ecrit_exacte === 0 ? 5 : 0;
        personnel.avertissement_ecrit_malus = personnel.nombre_avertissement_ecrit_exacte >= 2 ? -5 : Math.round((personnel.nombre_avertissement_ecrit_exacte * (-5) / 2) * 100) / 100;
      })
      console.log(this.liste_personnel_dynamique)
    }
    )
    this.calculNoteProduction();
}

calculNoteProduction() {
  if (this.liste_personnel_dynamique)
    this.liste_personnel_dynamique.forEach(personnel => {
      var pointsCommuniquer = 0;
      var pointsCooperer = 0;
      var pointsOrganiser = 0;
      var pointsProposer = 0;
      var pointsDisponibilite = 0;
      var pointsMotivation = 0;
    if(personnel.id_type_prod =='P') {
      pointsCommuniquer = parseInt(personnel.pointcommuniquer, 10) || 0;
      pointsCooperer = parseInt(personnel.pointcooperer, 10) || 0;
      pointsOrganiser = parseInt(personnel.pointorganiser, 10) || 0;
      pointsProposer = parseInt(personnel.pointproposer, 10) || 0;
      pointsDisponibilite = parseInt(personnel.pointdisponibilite, 10) || 0;
      pointsMotivation = parseInt(personnel.pointmotivation, 10) || 0;
      let totalPoints = pointsCommuniquer + pointsCooperer + pointsOrganiser + pointsProposer + pointsDisponibilite + pointsMotivation;
        const totalBonusMalus = personnel.retard_bonus + personnel.retard_malus +personnel.absence_bonus + personnel.absence_malus +personnel.avertissement_ecrit_bonus + personnel.avertissement_ecrit_malus +personnel.avertissement_verbal_bonus + personnel.avertissement_verbal_malus;
        totalPoints += totalBonusMalus;
      personnel.sommePoints = totalPoints / 10;
      personnel.note_savoir_etre = personnel.sommePoints > 5 ? 5 : Math.round(personnel.sommePoints * 100) / 100;
      }
    });
    // this.calculerNombreSavoirEtreDefinis();
}

setPage(page:number){
  if(page <1 || page > this.totalPages) {return};
  this.currentPage = page;
  const startIndex = (this.currentPage -1) * this.itemsPerPage;
  const endIndex = Math.min(startIndex + this.itemsPerPage -1, this.totalItems -1);

  this.liste_personnel_paginee = this.liste_personnel_dynamique.slice(startIndex, endIndex +1);
}

get pages(): number[] {
  let start = this.currentPage - 1;
  let end = this.currentPage + 1;
  if (this.currentPage === 1) {
  start = 1;
  end = Math.min(3, this.totalPages);
  } else if (this.currentPage === this.totalPages) {
  start = Math.max(1, this.totalPages - 2);
  end = this.totalPages;
  } else {
  start = Math.max(1, this.currentPage - 1);
  end = Math.min(this.currentPage + 1, this.totalPages);
  }
  return Array.from({ length: (end - start + 1) }, (_, i) => start + i);
  }
  
// calculerNombreSavoirEtreDefinis() {
//   var nombre_savoir_etre = 0;
//   if (this.liste_personnel_dynamique) {
//     this.liste_personnel_dynamique.forEach(personnel => {
//       personnel.status_savoir_etre = personnel.note_savoir_etre != 0 && personnel.note_savoir_etre != undefined ? 1 : 0;
//       nombre_savoir_etre += personnel.status_savoir_etre;
//     })
//     this.nombre_savoir_etre_definis = nombre_savoir_etre;
// }
// }

saveSavoirEtre(index: any, personnel: any) {
  if (
    !personnel.pointcommuniquer ||
    !personnel.pointcooperer ||
    !personnel.pointproposer ||
    !personnel.pointorganiser ||
    !personnel.pointdisponibilite ||
    !personnel.pointmotivation
  ) {
    this.toast.Error('Veuillez remplir tous les points avant d\'enregistrer.');
    return;
  }

  var dataSavoir = {
    fullname: personnel.nom + " " + personnel.prenoms,
    matricule: personnel.matricule,
    libelle_fonction: personnel.nom_poste,
    num_fonction: personnel.fct,
    libelle_processus: personnel.libelle_processus,
    selectedPointCommuniquer: parseInt(personnel.pointcommuniquer),
    selectedPointCooperer: parseInt(personnel.pointcooperer),
    selectedPointProposer: parseInt(personnel.pointproposer),
    selectedPointOrganiser: parseInt(personnel.pointorganiser),
    selectedPointDisponibilite: parseInt(personnel.pointdisponibilite),
    selectedPointMotivation: parseInt(personnel.pointmotivation),
    status_savoir_etre: personnel.status_savoir_etre,
    note_personnel: personnel.note_savoir_etre,
  };
  interface SaveSavoiretreResponse {
    message: string;
    operation: 'insertion' | 'modification';
    data?: any;
  }

  this.savoiretreService.saveSavoiretre(dataSavoir).subscribe(
    (response: SaveSavoiretreResponse) => {
      if (response.operation === 'insertion') {
        this.toast.Success('Données enregistrées avec succès');
      } else if (response.operation === 'modification') {
        this.toast.Info('Données modifiées avec succès');
      } else {
        this.toast.Error('Opération réussie, mais réponse inattendue du serveur');
      }
    },
    error => {
      this.toast.Error('Erreur lors de l\'enregistrement');
    }
  );
}

filtreByProcessus(){
  this.liste_personnel_dynamique = this.liste_personnel_statique.filter(t => (t.num_processus) == (this.processus))
  // this.calculerNombreSavoirEtreDefinis();
  this.miseAJourPaginationApresFiltrage();
}

filtreByMatricule(matricule:any){
  this.liste_personnel_dynamique = this.liste_matricule_filtrable.filter(t => t.matricule.includes(matricule))
  this.liste_personnel_paginee = this.liste_matricule_filtrable.filter(t => t.matricule.includes(matricule))
  // this.calculerNombreSavoirEtreDefinis();
  this.miseAJourPaginationApresFiltrage();

}

filtreByProcLigne(processus:any, ligne:any){
  if(ligne != "" && processus != ""){
    this.liste_personnel_dynamique = this.liste_personnel_statique.filter(t => (t.num_processus) == (this.processus && t.ligne_defaut == ligne))
    this.liste_matricule_filtrable = this.liste_personnel_statique.filter(t => t.num_processus == (this.processus && t.ligne_defaut == ligne))
  } else if (ligne == "" && processus != "") {
    this.liste_personnel_dynamique = this.liste_personnel_statique.filter(t => (t.num_processus) == (this.processus))
    this.liste_matricule_filtrable = this.liste_personnel_statique.filter(t => (t.num_processus) == (this.processus))
  }
  // this.calculerNombreSavoirEtreDefinis();
  this.miseAJourPaginationApresFiltrage();
  this.matricule_filtre = ""
}

miseAJourPaginationApresFiltrage() {
  this.totalItems = this.liste_personnel_dynamique.length;
  this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
  this.setPage(1);
}

}
