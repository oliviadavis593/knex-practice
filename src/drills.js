require('dotenv').config()
const knex = require('knex')
const ShoppingListService = require('../src/shopping-list-service')

const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL,
})

//get all items that contain text
//searchTerm => will be any string 
//function queries shopping_list table using Knex methods 
//...& selects the rows which have a name that contains the searchTerm 
//using case insensitive match 
function searchByItemName(searchTerm) {
    knexInstance
        .select('*')
        .from('shopping_list')
        .where('name', 'ILIKE', `%${searchTerm}%`)
        .then(result => {
            console.log('SEARCH TERM', { searchTerm })
            console.log(result)
        })
}

searchByItemName('urger')

//get all items paginated 
//pageNumber => will be a number 
//function queries shopping_list table using Knex methods
//..and selects the pageNumber page of rows paginated to 6 items per page
function paginateItems(pageNumber) {
    const limit = 6
    const offset = limit * (pageNumber - 1)
    knexInstance
        .select('*')
        .from('shopping_list')
        .limit(limit)
        .offset(offset)
        .then(result => {
            console.log('PAGINATE ITEMS', { pageNumber })
            console.log(result)
        })
}

paginateItems(2)

//get all items after added date
//daysAgo param => represents a number of days 
//function queries the shopping_list tables using Knex methods 
//..& selects the rows which have a date_added that's greater than the daysAgo
function productsAddedDaysAgo(daysAgo) {
    knexInstance
        .select('id', 'name', 'price', 'date_added', 'checked', 'category')
        .from('shopping_list')
        .where(
            'date_added',
            '>',
            knexInstance.raw(`now() - '?? days'::INTERVAL`, daysAgo)
        )
        .then(results => {
            console.log('PRODUCTS ADDED DAYS AGO')
            console.log(results)
        })
}

productsAddedDaysAgo(5)

//get total cost for each category 
//function takes no params 
//selects the rows grouped by their category & shows total price for each category
function costPerCategory() {
    knexInstance
        .select('category')
        .sum('price as total')
        .from('shopping_list')
        .groupBy('category')
        .then(result => {
            console.log('COST PER CATEGORY')
            console.log(result)
        })
}

costPerCategory()

console.log(ShoppingListService.getShoppingList())