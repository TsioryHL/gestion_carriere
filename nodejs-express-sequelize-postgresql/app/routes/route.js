const express = require('express'); //import express
const router  = express.Router(); 

const menuController = require('../controllers/menu_controller'); 
router.post('/get-menu', menuController.getMenu); 
router.get('/get-date', menuController.getDateNow); 
router.post('/get-login', menuController.getLogin); 
router.get('/get-max-rang-menu', menuController.getMaxRangMenu)
router.post('/update-menu', menuController.updateMenu)
router.post('/update-rang-menu', menuController.updateRangMenu)
router.post('/supprimer-menu', menuController.supprimerMenu)
router.post('/insert-menu', menuController.insertMenu)
router.post('/update_sous_menu', menuController.updateSousMenu)
router.get('/get-titre', menuController.getTitre)
router.post('/update-titre', menuController.updateTitre)
router.post('/login-gpao', menuController.getLoginFromGpao)

const usersController = require('../controllers/users_controller'); 
router.get('/get-all-users', usersController.getAllUsers);
router.post('/delete-user', usersController.deleteUser);
router.post('/insert-users', usersController.insertUser);
router.post('/update-users', usersController.updateUser);
router.post('/get-user', usersController.getUser);
router.post('/get-user-gpao', usersController.getAllUsersGPAO); 
router.get('/get-processus-lean', usersController.getProcessusLean);

const dateTimeController = require('../controllers/date_controller');
router.get('/get-date-time', dateTimeController.getDateTime);

// upload file
const controller = require('../controllers/file.controller');
router.post('/upload', controller.upload);
router.get("/files", controller.getListFiles);
router.get("/files/:name", controller.download);

const paramcontroll = require ('../controllers/carriere/paramcontroll')
router.get('/get-processus', paramcontroll.Processus)
router.get('/get-fonction', paramcontroll.Fonction)
router.get('/get-niveau', paramcontroll.Niveau)
router.get('/get-all-niveau', paramcontroll.getAllNiveau)
router.post('/update-processus-poste', paramcontroll.updateProcessusPoste)
router.post('/recup-referentiel', paramcontroll.getReferentiel)
router.post('/recup-referentiel-categorie', paramcontroll.getReferentielCategorie)
router.post('/save-niveau', paramcontroll.saveNiveaucategorie)
router.post('/delete-categorie', paramcontroll.deleteCategorie)
router.post('/save-referentiel-categorie', paramcontroll.saveRefCategorie)

const savoircontroll = require ('../controllers/carriere/savoircontroll')
router.post('/get-information', savoircontroll.getInformation)
router.get('/get-all-categorie', savoircontroll.getAllCategorie)
router.post('/save-savoir', savoircontroll.saveSavoirProc)
router.post('/get-liste-personnel', savoircontroll.getListePersonnel)
router.post('/get-information_savoir_categorie', savoircontroll.getInformationWithCategorie)

const savoiretrecontroll = require ('../controllers/carriere/savoiretrecontroll')
router.get('/get-point', savoiretrecontroll.getPoint)
router.post('/get-synthese-sanction', savoiretrecontroll.getSyntheseSanction)
router.post('/save-savoir_etre', savoiretrecontroll.saveSavoiretre)
router.get('/get-liste-personnel-savoir_etre', savoiretrecontroll.getListePersonnel)
router.get('/get-ligne-production', savoiretrecontroll.getLigneProduction)

const savoirfaireprod = require('../controllers/carriere/savoirfaireprod')
router.post('/get-savoirfaire-prod', savoirfaireprod.getsavoirFaireProdDate)
router.post('/get-savoirfaire-pointage', savoirfaireprod.getGeoPointageData)
router.post('/get-savoirfaire-pointage', savoirfaireprod.getGeoPointageData)
router.post('/get-liste_prod', savoirfaireprod.getListeProd)
router.post('/save-liste_prod', savoirfaireprod.saveSituationProd)
router.get('/get-situation_prod', savoirfaireprod.getSituationProd)
router.get('/get-objectif-cadence', savoirfaireprod.getObjectifCadence)

module.exports = router; // export to use in server.js
