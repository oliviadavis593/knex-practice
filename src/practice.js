require('dotenv').config()
//required knex
const knex = require('knex')

//created knex instance 
//specifies where to connect to, username & password & which driver to use
const knexInstance = knex({
    client: 'pg',
    //moved string into enviornment var => don't want connection details hardcoded 
    //then we required & used the environmental var here (below & line: 1)
    connection: process.env.DB_URL
})

console.log('knex and driver installed correctly');