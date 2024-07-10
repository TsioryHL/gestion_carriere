const { range } = require("rxjs");
const pool = require("../../config/db.config");
const poolGPAO = require("../../config/db.configpgGpao");
const poolGeo = require("../../config/db.config.geo");
const poolLean = require("../../config/db.configlean");
const execution = require("../../controllers/executeQuery_controller")

async function getsavoirFaireProdDate (req,res) {
    const donneeFinal = [];
    const { matricule, date } = req.body.data;
    for (let item of date) {
        var moisFormatted = item.mois.toString().padStart(2, '0');//format mois MM
        var anneeFormatted = item.annee;
        var requete = `select pm.*, dgl.libelle as lib_ligne, dgp.libelle as lib_plan, dgf.libelle as lib_fonction, dgo.libelle as lib_operation from fact.prime_mois pm left join (select id_ligne, libelle from geo.ligne) as dgl on pm.id_ligne = dgl.id_ligne left join (select id_plan, libelle from geo.plan) as dgp on pm.id_plan = dgp.id_plan left join (select id_fonction, libelle from geo.fonction) as dgf on pm.id_fonction = dgf.id_fonction left join (select id_operation, libelle from geo.operation) as dgo on pm.id_operation = dgo.id_operation where pm.matricule = $1 and pm.annee = $2 and pm.mois = $3`;
        const { rows } = await poolGPAO.query(requete, [matricule, anneeFormatted, moisFormatted]);
        rows.forEach(row => donneeFinal.push(row));
    }
    if(donneeFinal.length > 0){res.status(200).send(donneeFinal);}
}

async function getGeoPointageData(req, res) {
    const donneeFinal = [];
    const { matricule, date } = req.body.data;
    for (let item of date) {
        var moisFormatted = item.mois.toString().padStart(2, '0'); // Format mois MM
        var anneeFormatted = item.annee;
        var requetePointage = `SELECT gp.*, dgl.libelle AS lib_ligne, dgp.libelle AS lib_plan, dgf.libelle AS lib_fonction, dgo.libelle AS lib_operation FROM geo.geo.pointage gp LEFT JOIN geo.ligne dgl ON gp.id_ligne = dgl.id_ligne LEFT JOIN geo.plan dgp ON gp.id_plan = dgp.id_plan LEFT JOIN geo.fonction dgf ON gp.id_fonction = dgf.id_fonction LEFT JOIN geo.operation dgo ON gp.id_operation = dgo.id_operation WHERE gp.id_perso = $1 AND EXTRACT(YEAR FROM gp.jour) = $2 AND EXTRACT(MONTH FROM gp.jour) = $3`;
        const resultsPointage = await poolGeo.query(requetePointage, [matricule, anneeFormatted, moisFormatted]);
        resultsPointage.rows.forEach(row => donneeFinal.push(row));
    }
    if (donneeFinal.length > 0) {
        res.status(200).send(donneeFinal);
    } else {
        res.status(404).send({ message: "No data found." });
    }
}

async function getListeProd(req, res) {
    const { matricule, role } = req.body.data;
    const queryResult = await pool.query("SELECT * FROM carriere.vue_liste_personnel WHERE id_type_prod='P'");
    const liste_personnel = queryResult.rows;
    const responsables = await getResponsable();
    const lignesProduction = await getLigneProduction();
    responsables.forEach(t => (t.matricule));
    const isResponsible = responsables.some(item => item.matricule.includes(matricule));
    if (isResponsible && role === "Utilisateur" || role === "Manager") {
        const responsableInfo = responsables.filter(t => t.matricule.includes(matricule));
        const lignesRecherchees = responsableInfo.map(element => element.ligne.substring(0, 3).toUpperCase() === "APP" ? "ADM" : element.ligne.substring(0, 3).toUpperCase());
        const filteredLignesProduction = lignesProduction.filter(ligne => lignesRecherchees.includes(ligne.id_ligne));
        const filteredPersonnel = liste_personnel.filter(personnel => filteredLignesProduction.map(ligne => ligne.id_ligne).includes(personnel.ligne_defaut) || filteredLignesProduction.map(ligne => ligne.id_ligne).includes(personnel.abbrv_processus));
        res.status(200).send(filteredPersonnel);
    return
    } else if(role === "Responsable" || role === "Administrateur") {
        res.status(200).send(liste_personnel);
    }
}

async function getLigneProduction (req, res) {
    var requete = "select distinct id_ligne, lib_ligne from geo.vue_current_directe_gpao order by id_ligne asc"
    return await execution.executeQuery(poolGPAO,requete)
}

async function getResponsable(req, res) {
    var requete = "select * from dashboardlean.gestion_affectation_sous_processus"
    var resultat = await execution.executeQuery(poolLean, requete);
    var valeurPush = [];
    var ligne070 = [];
    resultat.forEach(item => {
        if (item.matricules != null) {
            item.matricules = JSON.parse(item.matricules);
            const matricules = item.matricules.map(mat => mat.matricule);
            if (['035', '045', '065', '030', '020'].includes(item.id_ligne)) {valeurPush.push({ ligne: item.id_ligne, matricule: matricules })} 
            else if (item.id_ligne.startsWith('070')) {ligne070 = ligne070.concat(matricules)} 
            else {valeurPush.push({ ligne: item.id_ligne, matricule: matricules })}
        }
    });
    if (ligne070.length > 0) {valeurPush.push({ ligne: '070', matricule: ligne070 })}
    const lignesExclues = ['DEV', 'SERVICES GENERAUX', 'METHODES ET QUALITE', 'APPROVISIONNEMENT', 'FACTURATION', 'INFRA-TECH', 'COMPTABILITE', 'RESSOURCES HUMAINES'];
    valeurPush = valeurPush.filter(item => !lignesExclues.includes(item.ligne));
    return valeurPush;
}

const saveSituationProd = (req, res) => {
    const {matricule, info_personnel, button_active} = req.body.data;
    pool.query("select count(*) from carriere.config_prod_situation where matricule = $1", [matricule], function (err, result){
        if(result.rows[0].count == 0){
            pool.query("INSERT INTO carriere.config_prod_situation (matricule, info_personnel, button_active) VALUES ($1,$2,$3)", [matricule, info_personnel,button_active], function (err, result){
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.status(200).send(result.rows);
            })
        } else {
            pool.query("UPDATE carriere.config_prod_situation SET info_personnel = $1 where matricule = $2", [info_personnel , matricule], function (err, result){
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.status(200).send(result.rows);
            })
        }
    })
}

const getSituationProd = (req,res) => {
    pool.query("select * from carriere.config_prod_situation", [], function (err, result){
        if (err) {
            res.status(400).send(err);
            return;
        }
        res.status(200).send(result.rows);
    })
}

const getObjectifCadence = (req, res) => {
    poolGPAO.query("SELECT o.* FROM public.objectif_cadence_lpfo o INNER JOIN (SELECT DISTINCT ON (id_plan, id_operation) id_plan, id_operation, date_objectif FROM public.objectif_cadence_lpfo WHERE nhac != '0' ORDER BY id_plan, id_operation, date_objectif DESC) latest ON o.id_operation = latest.id_operation AND o.id_plan = latest.id_plan AND o.date_objectif = latest.date_objectif WHERE o.nhac != '0';", [], function (err, result){
        if (err) {
            res.status(400).send(err);
            return;
        }
        res.status(200).send(result.rows);
    })
}

module.exports = {getsavoirFaireProdDate, getGeoPointageData, getListeProd, saveSituationProd, getSituationProd, getObjectifCadence}