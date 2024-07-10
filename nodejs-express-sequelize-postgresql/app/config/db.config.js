const { Pool, Client } = require('pg');

// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'dev_hello',
//   password: 'postgres',
//   port: 5432,
// });

const pool = new Pool({
  user: 'postgres',
  host: '192.168.12.232',
  database: 'gestion_carriere',
  password: 'postgres',
  port: 5432,
});

pool.connect(function(error){
  if(!!error){
    console.log(error);
  }else{
    console.log('Connected! Gestion des Carrières');
  }
});

module.exports = pool;