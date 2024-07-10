const { Pool, Client } = require('pg');

const poolOutils_RH = new Pool({
    user: 'postgres',
    host: '192.168.12.232',
    database: 'outils_rh',
    password: 'postgres',
    port: 5432,
  });

  poolOutils_RH.connect(function(error){
    if(!!error){
      console.log(error);
    }else{
      console.log('Connected! Outils RH');
    }
  });

  module.exports = poolOutils_RH;