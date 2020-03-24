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

/*FIRST APPROACH */
//Converting knex query into raw SQL string to check what it equivalent to
//Purely to look at what's happening behinf the seens
//We use .toQuery() to get SQL query & console.log it 
//toQuery() returned a string of the query at its current state for debugging purposes
//const q1 = knexInstance('amazong_products').select('*').toQuery()
//const q2 = knexInstance.from('amazong_products').select('*').toQuery()

//console.log('q1:', q1)
//console.log('q2:', q2)

/*BETTER APPROACH (using promise-like) */
//using the more explicit form of the query 
//running the script adds a limit 1 to the query & thus improves performance slightly
const qry = knexInstance
    .select('product_id', 'name', 'price', 'category')
    .from('amazong_products')
    .where({ name: 'Point of view gun'})
    .first() //will only select the 1st item found
    .toQuery()

    console.log(qry)


//a function that accepts search term as a param 
//so we can use the word that user decides when they're readys
function searchByProduceName(searchTerm) {
    //we've built the query in knex after verifying it in DBeaver 
    knexInstance
        .select('product_id', 'name', 'price', 'category')
        .from('amazong_products')
        .where('name', 'ILIKE', `%${searchTerm}%`)
        .then(result => {
            //console.log(result)
        })
}

searchByProduceName('holo')

//function allows us to achieve pagnation 
function paginateProducts(page) {
    const productsPerPage = 10
    const offset = productsPerPage * (page - 1)
    knexInstance
        .select('product_id', 'name', 'price', 'category')
        .from('amazong_products')
        .limit(productsPerPage)
        .offset(offset)
        .then(result => {
            //console.log(result)
        })
}

paginateProducts(2)

//only display products that have images 
function getProductsWithImages() {
    knexInstance
        .select('product_id', 'name', 'price', 'category', 'image')
        .from('amazong_products')
        .whereNotNull('image')
        .then(result => {
            console.log(result)
        })
}

getProductsWithImages()

//display most popular videos specified by a number of days 
function mostPopularVideosForDays(days) {
    knexInstance
        .select('video_name', 'region')
        .count('date_viewed AS views')
        .where(
            'date_viewed',
            '>',
            knexInstance.raw(`now() - '?? days'::INTERVAL`, days)   
        )
        .from('whopipe_video_views')
        .groupBy('video_name', 'region')
        .orderBy([
            { column: 'region', order: 'ASC' },
            { column: 'views', order: 'DESC' }
        ])
        .then(result => {
            console.log(result)
        })
}

mostPopularVideosForDays(30)

/* ABOUT mostPopularVideosForDays */
//To acheive the SQL count(date_viewed) AS views => needed to use .count instead of listing column in the select method
//orderBy => allows us to "order by" multiple columns by specifying an array 
//Knex doesn't have method for now() - '30 days'::INTERVAL => knex provides fallback method called .raw() - use "raw" SQL as string


console.log('knex and driver installed correctly');