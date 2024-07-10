const { range } = require("rxjs");
const pool = require("../../config/db.config");
const poolGPAO = require("../../config/db.configpgGpao");
const poolLean = require("../../config/db.configlean");
const execution = require("../../controllers/executeQuery_controller")

const Processus = (req, res, next) => {     
    poolGPAO.query("select * from processus order by libelle_processus asc", [], function (err, result) {
        if (err) { res.status(400).send(err);}
        if (Object.keys(result).length > 0) {
            res.status(200).send(result.rows);
        } else {
            res.status(200).send();
        }
    });
};

const Fonction = (req, res, next) => {     
    poolGPAO.query("select * from fonction where nom_fonction != '' order by nom_fonction asc", [], function (err, result) {
        if (err) {
            res.status(400).send(err);
        }
        if (Object.keys(result).length > 0) {
            res.status(200).send(result.rows);
        } else {
            res.status(200).send();
        }
    });
};

const Niveau = (req, res, next) => {     
    pool.query("select * from carriere.niveau order by id asc", [], function (err, result) {
       if (err) {
        res.status(400).send(err);
        }
        if (Object.keys(result).length > 0) {
            res.status(200).send(result.rows);
        } else {
            res.status(200).send();
        }
    });
};

async function updateProcessusPoste (req, res, next) {
    const data = req.body.data
    for(let i=0; i<data.length; i++){
        for(let y=0; y<data[i].length; y++){
            // var requete = "update carriere.poste set processus = '"+parseInt(i+1)+"' where id ="+data[i][y].id
            var requete = "update fonction set processus = '"+parseInt(i)+"' where id_fonction ="+data[i][y].id_fonction
            await execution.executeQuery(poolGPAO, requete)
        }
    }
    res.status(200).send();
}

const saveRefCategorie = (req, res) => {
    const { processus, fonction, referentiel_categorie, matricule } = req.body.data;
    pool.query("select count(*) from carriere.ref_poste_categorie where num_poste = $1", [fonction], function (err, result) {
        var resultat = parseInt(result.rows[0].count)
        if(resultat == 0){
            pool.query("INSERT INTO carriere.ref_poste_categorie (processus, num_poste, referentiel_categorie, matricule) VALUES ($1, $2, $3, $4)", [processus, fonction, referentiel_categorie, matricule], function (err, result) {
                poolGPAO.query("UPDATE fonction SET status_ref = $1 where num_fonction = $2", [1, fonction], function (err, result) {
                    if (err) {
                        res.status(400).send(err);
                        return;
                    }
                    res.status(200).send(result.rows);
                })
            })
        } else {
            pool.query("UPDATE carriere.ref_poste_categorie SET referentiel_categorie = $1, matricule = $2 where num_poste = $3", [referentiel_categorie, matricule, fonction], function (err, result) {
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.status(200).send(result.rows);
            })
        }
    })
};

const getReferentiel = (req, res, next) => {
    const fonction = req.body.fonction
    pool.query("select * from carriere.ref_poste where num_poste = $1", [fonction], function (err, result) {
        if (err) {
            res.status(400).send(err);
            return;
        }
        res.status(200).send(result.rows);
    })
}

const getReferentielCategorie = (req, res, next) => {
    const fonction = req.body.fonction
    pool.query("select * from carriere.ref_poste_categorie where num_poste = $1", [fonction], function (err, result) {
        if (err) {
            res.status(400).send(err);
            return;
        }
        res.status(200).send(result.rows);
    })
}

const getAllNiveau = (req,res,next) => {
    pool.query("select * from carriere.niveau", [], function(err,result){
        if (err) {
            console.error(err);
            res.status(400).send(err);
            return;
        }
        res.status(200).send(result.rows);
    })
}

const saveNiveaucategorie = (req, res, next) => {
    const {nom_categorie, num_categorie, niveau} = req.body.data;
    pool.query("select count(*) from carriere.niveau where num_categorie = $1", [num_categorie], function(err,result){
        if(result.rows[0].count == 0){
            pool.query("insert into carriere.niveau (categorie, num_categorie ,niveau) values ($1, nextval('carriere.niveau_num_categorie_seq'),$2)", [nom_categorie, niveau], function(err,result){
                if (err) {
                    console.error(err); 
                    res.status(400).send(err);
                    return;
                }
                res.status(200).send(result.rows);
            })
        } else {
            pool.query("UPDATE carriere.niveau SET categorie = $1, niveau = $2 where num_categorie = $3", [nom_categorie ,niveau, num_categorie], function (err, result) {
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.status(200).send(result.rows);
            })
        }
    })
}

const deleteCategorie = (req, res) => {
    const { num_categories } = req.body;
    const query = `DELETE FROM carriere.niveau WHERE num_categorie = ANY($1::int[])`;
    pool.query(query, [num_categories], (err, result) => {
        if (err) {
            res.status(400).send(err);
            return;
        }
        res.status(200).send(result.rows);
    });
  };
  

module.exports = {Processus, Fonction, Niveau, updateProcessusPoste, saveRefCategorie, getReferentiel, getReferentielCategorie, saveNiveaucategorie, getAllNiveau, deleteCategorie};
