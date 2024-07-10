const { range } = require("rxjs");
const pool = require("../../config/db.config");
const poolOutils_RH = require("../../config/db.outils_rh");
const poolGPAO = require("../../config/db.configpgGpao");
const poolLean = require("../../config/db.configlean");
const execution = require("../../controllers/executeQuery_controller")

const getSyntheseSanction = async (req, res) => {
    const { date_debut, date_fin } = req.body.data;
    const annee = new Date(date_fin).getFullYear();
    const result = await pool.query("select vlp.*, COALESCE(oss.nombre_absences_exacte, 0) as nombre_absences_exacte, COALESCE(oss.nombre_avertissement_ecrit_exacte, 0) as nombre_avertissement_ecrit_exacte, COALESCE(oss.nombre_avertissement_verbal_exacte, 0) as nombre_avertissement_verbal_exacte, COALESCE(oss.nombre_retards_exacte, 0) as nombre_retards_exacte, COALESCE(se.pointcommuniquer, 0) as pointcommuniquer, COALESCE(se.pointcooperer, 0) as pointcooperer, COALESCE(se.pointdisponibilite, 0) as pointdisponibilite, COALESCE(se.pointmotivation, 0) as pointmotivation, COALESCE(se.pointorganiser, 0) as pointorganiser, COALESCE(se.pointproposer, 0) as pointproposer, COALESCE(se.note_savoir_etre, '') as note_savoir_etre from carriere.vue_liste_personnel vlp left join carriere.obtenir_synthese_sanctions($1,$2) oss on oss.matricule = vlp.matricule left join carriere.savoir_etre se on vlp.matricule = se.matricule order by vlp.matricule", [date_debut, date_fin]);
    const resultat = result.rows;
    for (let item of resultat) {
        if (item.id_type_prod == 'I') {
            const result2 = await poolOutils_RH.query("select * from eai.formulaire where id_eai=(select id from eai.eai where matricule = $1 and extract(year from date_eai) = $2)", [item.matricule, annee]);
            if (result2.rows.length != 0) {
                item.id_eai = result2.rows[0]["id_eai"];
                item.data_formulaire = JSON.parse(result2.rows[0]["data_formulaire"]);
                item.commentaire = result2.rows[0]["commentaire"];
            } else {
                item.id_eai = "";
                item.data_formulaire = [];
                item.commentaire = "";
            }
        }
    }
    res.status(200).send(resultat);
};

const getPoint = (req,res) => {
    pool.query("select * from carriere.point_savoir_etre order by num_point", [], function (err,result){
        if(err){
            res.status(400).send(err);
            return;
        }   
        res.status(200).send(result.rows);
    })
}

const saveSavoiretre = (req,res) => {
    const {fullname, matricule, num_fonction, libelle_fonction, libelle_processus,selectedPointCommuniquer,selectedPointCooperer, selectedPointProposer, selectedPointOrganiser, selectedPointDisponibilite, selectedPointMotivation, status_savoir_etre, note_personnel} = req.body.data;
    pool.query("select count(*) from carriere.savoir_etre where matricule = $1", [matricule], function (err,result){
        if(result.rows[0].count == 0){
            pool.query("insert into carriere.savoir_etre (fullname,matricule,num_fonction,libelle_fonction,libelle_processus,pointcommuniquer,pointcooperer,pointproposer,pointorganiser,pointdisponibilite,pointmotivation,status_savoir_etre,note_savoir_etre) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)" , [fullname, matricule, num_fonction, libelle_fonction, libelle_processus,selectedPointCommuniquer,selectedPointCooperer, selectedPointProposer, selectedPointOrganiser, selectedPointDisponibilite, selectedPointMotivation,status_savoir_etre, note_personnel], function (err, result){
                if(err){
                    res.status(400).send(err); 
                    return;
                }   
                res.status(201).send({ message: "Données enregistrées avec succès", operation: "insertion", data: result.rows[0] });
            })
        } else {
            pool.query("UPDATE carriere.savoir_etre SET pointcommuniquer = $1, pointcooperer = $2, pointproposer = $3, pointorganiser = $4, pointdisponibilite = $5, pointmotivation = $6, note_savoir_etre =$7 where matricule =$8", [selectedPointCommuniquer,selectedPointCooperer, selectedPointProposer, selectedPointOrganiser, selectedPointDisponibilite, selectedPointMotivation, note_personnel, matricule], function (err, result){
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.status(200).send({ message: "Données modifiées avec succès", operation: "modification", data: result.rows[0] });
            })
        }
    })
}

const getListePersonnel = (req,res) => {
    pool.query("select vlp.*,COALESCE(se.pointcommuniquer, 0) as pointcommuniquer,COALESCE(se.pointcooperer, 0) as pointcooperer,COALESCE(se.pointdisponibilite, 0) as pointdisponibilite,COALESCE(se.pointmotivation, 0) as pointmotivation,COALESCE(se.pointorganiser, 0) as pointorganiser,COALESCE(se.pointproposer, 0) as pointproposer,COALESCE(se.note_savoir_etre, '') as note_savoir_etre from carriere.vue_liste_personnel vlp left join carriere.savoir_etre se on vlp.matricule = se.matricule", [], function (err,result){
        if (err) {
            res.status(400).send(err);
            return;
        }
        res.status(200).send(result.rows);
    })
}

const getLigneProduction = (req,res) => {
    poolGPAO.query("select distinct id_ligne, lib_ligne from geo.vue_current_directe_gpao order by id_ligne asc", [], function (err,result){
        if (err) {res.status(400).send(err);return;}
        res.status(200).send(result.rows);
    })
}  

module.exports = {getPoint,saveSavoiretre, getListePersonnel, getSyntheseSanction, getLigneProduction}