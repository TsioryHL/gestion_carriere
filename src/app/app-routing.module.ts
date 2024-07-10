import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Page404Component } from './page404/page404.component';
import { AccueilComponent } from './accueil/accueil.component';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { GestionMenuComponent } from './gestion-menu/gestion-menu.component';
import { AppComponent } from './app.component';
import { ParametrageComponent } from './parametrage/parametrage.component';
import { NotesavoirComponent } from './notesavoir/notesavoir.component';
import { SavoiretreComponent } from './savoiretre/savoiretre.component';
import { ProdComponent } from './prod/prod.component';
import { CadreComponent } from './cadre/cadre.component';
import { PosteComponent } from './poste/poste.component';



const routes: Routes = [
  { path: '', component: AppComponent , data: {titreComponent : 'Gestion des carrières'}},
  { path: 'accueil', component: AccueilComponent, data: {titreComponent : 'Accueil'}},
  { path: 'users', component: UtilisateurComponent, data: {titreComponent : 'Gestion d\'utilisateur'}},
  { path: 'gestion-menu', component: GestionMenuComponent, data: {titreComponent : 'Gestion de menu'}},
  { path: 'parametrage', component: ParametrageComponent, data: {titreComponent : 'Paramétrage'}},
  { path: 'notesavoir', component: NotesavoirComponent, data: {titreComponent : 'Savoir'}},
  { path: 'savoiretre', component: SavoiretreComponent, data: {titreComponent : 'Savoir Etre'}},
  { path: 'prod', component: ProdComponent, data: {titreComponent : 'Savoir faire | Production'}},
  { path: 'cadre', component: CadreComponent, data: {titreComponent : 'Savoir faire | Improd'}},
  { path: 'poste', component: PosteComponent, data: {titreComponent : 'Paramétrage fonction'}},
  { path: '**', pathMatch: 'full', component: Page404Component, title: '404 Page'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }  


