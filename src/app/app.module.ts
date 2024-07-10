import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Page404Component } from './page404/page404.component';
import { HttpClientModule } from '@angular/common/http';
import { AccueilComponent } from './accueil/accueil.component';
import { UtilisateurComponent } from './utilisateur/utilisateur.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { GestionMenuComponent } from './gestion-menu/gestion-menu.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { FilterPipe } from './services/filter/filter.pipe';
import { ParametrageComponent } from './parametrage/parametrage.component';
import { MatButtonModule } from '@angular/material/button';
import { NotesavoirComponent } from './notesavoir/notesavoir.component';
import { SavoiretreComponent } from './savoiretre/savoiretre.component';
import { ProdComponent } from './prod/prod.component';
import { CadreComponent } from './cadre/cadre.component';
import { PosteComponent } from './poste/poste.component';



@NgModule({
  declarations: [
    AppComponent,
    Page404Component,
    AccueilComponent,
    UtilisateurComponent,
    GestionMenuComponent,
    FilterPipe,
    ParametrageComponent,
    NotesavoirComponent,
    SavoiretreComponent,
    ProdComponent,
    CadreComponent,
    PosteComponent,
  ],
  imports: [
    MatButtonModule,
    Ng2SearchPipeModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    DragDropModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
