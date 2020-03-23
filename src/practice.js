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

//Converting knex query into raw SQL string to check what it equivalent to
//Purely to look at what's happening behinf the seens
//We use .toQuery() to get SQL query & console.log it 
const q1 = knexInstance('amazong_products').select('*').toQuery()
const q2 = knexInstance.from('amazong_products').select('*').toQuery()

console.log('q1:', q1)
console.log('q2:', q2)
console.log('knex and driver installed correctly');