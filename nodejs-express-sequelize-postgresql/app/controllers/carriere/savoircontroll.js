const { range } = require("rxjs");
const pool = require("../../config/db.config");
const poolGPAO = require("../../config/db.configpgGpao");
const poolLean = require("../../config/db.configlean");
const execution = require("../../controllers/executeQuery_controller")

const getInformation = (req, res) => {
    const information = req.body.matricule;
    poolGPAO.query("select * from public.operateur where matricule=$1", [information], function (err, result) {
        if (err) {
            res.status(400).send(err);
            return;
        }
        res.status(200).send(result.rows);
    })
}

const saveSavoirProc = (req, res) => {
    const {matricule, fullname, num_fonction, libelle_fonction, anciennete, libelle_processus, referentiel_categorie ,autre_savoir, note_poste_requis, note_poste_acceptable, frequence_autre_savoir, confirmedSelectedCategories,liste_frequence_autre_savoir} = req.body.data;
    pool.query("select count(*) from carriere.savoir where matricule = $1", [matricule], function (err, result){
        if(result.rows[0].count == 0){
            pool.query("INSERT INTO carriere.savoir (matricule, full_name, num_fonction, libelle_fonction, libelle_processus, referentiel_categorie, autre_savoir, note_poste, frequence_autre_savoir, confirmed_selected_categories,liste_frequence_autre_savoir,note_poste_acceptable) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [matricule, fullname, num_fonction, libelle_fonction, libelle_processus, referentiel_categorie, autre_savoir, note_poste_requis, frequence_autre_savoir, confirmedSelectedCategories, liste_frequence_autre_savoir, note_poste_acceptable], function (err, result){
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.status(200).send(result.rows);
            })
        } else {
            pool.query("UPDATE carriere.savoir SET referentiel_categorie = $1, autre_savoir = $2, note_poste = $3, frequence_autre_savoir = $4, confirmed_selected_categories = $5,liste_frequence_autre_savoir = $6, note_poste_acceptable = $7, num_fonction = $8, libelle_fonction = $9, libelle_processus = $10 where matricule = $11", [referentiel_categorie, autre_savoir, note_poste_requis, frequence_autre_savoir, confirmedSelectedCategories,liste_frequence_autre_savoir, note_poste_acceptable, num_fonction, libelle_fonction, libelle_processus, matricule], function (err, result){
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.status(200).send(result.rows);
            })
        }
    })
}

const getInformationWithCategorie = (req, res) => {
    const {matricule, fonction} = req.body.data
    pool.query("select * from carriere.savoir where matricule = $1", [matricule], function (err, result){
        if (err) {res.status(400).send(err); return;}
        var resultat_savoir = result.rows
        var exist_data_savoir = false
        var data_feedback = []
        if(resultat_savoir.length != 0){
            resultat_savoir[0].referentiel_categorie = JSON.parse(resultat_savoir[0].referentiel_categorie);
            resultat_savoir[0].autre_savoir = JSON.parse(resultat_savoir[0].autre_savoir)
            resultat_savoir[0].confirmed_selected_categories = JSON.parse(resultat_savoir[0].confirmed_selected_categories)
            resultat_savoir[0].liste_frequence_autre_savoir = JSON.parse(resultat_savoir[0].liste_frequence_autre_savoir)
            exist_data_savoir = parseInt(resultat_savoir[0].num_fonction) == parseInt(fonction)
        }
        postFonctionCategorie(fonction).then(referentiel => {
            referentiel[0].referentiel_categorie = JSON.parse(referentiel[0].referentiel_categorie);
            mettreAJourInformations(referentiel[0].referentiel_categorie, exist_data_savoir ? resultat_savoir[0].referentiel_categorie : []);
            var donnee = {
                info_existe: exist_data_savoir,
                nom_processus: exist_data_savoir ? resultat_savoir[0].libelle_processus : referentiel[0].libelle_processus,
                nom_fonction: exist_data_savoir ? resultat_savoir[0].libelle_fonction : referentiel[0].nom_fonction,
                referentiel_categorie: exist_data_savoir ? resultat_savoir[0].referentiel_categorie : referentiel[0].referentiel_categorie,
                autre_savoir: exist_data_savoir ? resultat_savoir[0].autre_savoir : [],
                moyenne_requis: exist_data_savoir ? resultat_savoir[0].note_poste : 0,
                moyenne_acceptable: exist_data_savoir ? resultat_savoir[0].note_poste_acceptable : 0,
                confirmedSelectedCategories : exist_data_savoir ? resultat_savoir[0].confirmed_selected_categories : [],
                liste_processus: exist_data_savoir ? resultat_savoir[0].liste_frequence_autre_savoir : []
            };
        data_feedback.push(donnee)
        res.status(200).send(data_feedback);
    })
    })
}

function mettreAJourInformations(tableau1, tableau2) {
    for (let i = 0; i < tableau1.length; i++) {
        let trouve = false;
        for (let j = 0; j < tableau2.length; j++) {
            if (tableau1[i].ref === tableau2[j].ref) {
                tableau1[i] = tableau2[j];
                trouve = true;
                break;
            }
        }
        if (!trouve) {
            tableau1[i].libelle_niveau = '';
            tableau1[i].note_actuel = 0;
            tableau1[i].note_requis = 0;
            tableau1[i].note_acceptable = 0;
        }
    }
}

async function postFonctionCategorie (fonction) {
    // var requete = "select po.num_poste,po.nom_poste, pr.num_processus,pr.libelle_processus, rp.referentiel_poste from carriere.poste po inner join carriere.processus pr on pr.num_processus = po.processus inner join carriere.ref_poste rp on rp.num_poste = po.num_poste where po.num_poste="+fonction
    var requete = "select vf.num_fonction, vf.nom_fonction, vf.libelle_processus, rp.referentiel_categorie from carriere.vue_fonction vf inner join carriere.ref_poste_categorie rp on rp.num_poste = vf.num_fonction where vf.num_fonction ="+fonction
    return await execution.executeQuery(pool, requete)
}

const getAllCategorie = (req, res) => {
    pool.query("select * from carriere.ref_poste_categorie", [], function (err, result){
        if (err) {
            res.status(400).send(err);
            return;
        }
        res.status(200).send(result.rows);
    })
}

const getListePersonnel = (req, res) => {
    const {matricule, role} = req.body.data
    pool.query("select * from carriere.vue_liste_personnel", [], function (err, result){
        if (err) { res.status(400).send(err); return;}
        var liste_personnel = result.rows
        getResponsable().then(data => {
            var info_personnel = liste_personnel.filter(t => t.matricule == matricule)
            if(data.find(t => t.matricule == matricule) && role == "Utilisateur"){
                var donnees = data.filter(t => t.matricule == matricule)
                const lignesRecherchees = donnees.map(element => element.ligne.substring(0,3).toUpperCase() == "APP" ? "ADM" : element.ligne.substring(0,3).toUpperCase())
                var resultat = liste_personnel.filter(personnel => lignesRecherchees.includes(personnel.ligne_defaut) || lignesRecherchees.includes(personnel.abbrv_processus))
                getLigneProduction().then(dataLigne => {
                    info_personnel.push({responsable_processus:true})
                    var ligne = dataLigne.filter(ligne => lignesRecherchees.includes(ligne.id_ligne))
                    var arrayResult = [resultat,ligne,info_personnel]
                    res.status(200).send(arrayResult)
                })
            } else if(role != "Utilisateur" || role == ""){
                getLigneProduction().then(dataLigne => {
                    info_personnel.push({responsable_processus:false})
                    var arrayResult = [liste_personnel,dataLigne,info_personnel]
                    res.status(200).send(arrayResult)
                })
            }
        })
    })
}

async function getLigneProduction (req, res) {
    var requete = "select distinct id_ligne, lib_ligne from geo.vue_current_directe_gpao order by id_ligne asc"
    return await execution.executeQuery(poolGPAO,requete)
}

async function getResponsable (req, res) {
    var requete = "select * from dashboardlean.gestion_affectation_sous_processus"
    var resultat = await execution.executeQuery(poolLean,requete)
    var valeurPush = []
    resultat.forEach(item => {
        item.matricules_cl = JSON.parse(item.matricules_cl)
        if(item.matricules_cl != null) valeurPush.push(Object.assign({ligne:item.id_ligne},{matricule:item.matricules_cl[0].matricule}))
    })
    return valeurPush
}

module.exports = {getInformation, saveSavoirProc, getListePersonnel, getResponsable, getInformationWithCategorie, getAllCategorie}