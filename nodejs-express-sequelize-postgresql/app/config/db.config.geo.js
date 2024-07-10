const { Pool, Client } = require('pg');

// const pool = new Pool({
//   user: 'postgres',
//   host: 'localhost',
//   database: 'dev_hello',
//   password: 'postgres',
//   port: 5432,
// });

const pool = new Pool({
  user: 'basicgeo',
  host: 'mgta-geo.intra.jouve.com',
  database: 'geo',
  password: 'oegcisab',
  port: 5432,
});

pool.connect(function(error){
  if(!!error){
    console.log(error);
  }else{
    console.log('Connected! GEO');
  }
});

module.exports = pool;