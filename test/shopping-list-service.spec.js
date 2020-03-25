const ShoppingListService = require('../src/shopping-list-service')
const knex = require('knex')

describe(`ShoppingList Service object`, () => {
    let db
    let shoppingTestArticles = [
        {
            id: 1,
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            checked: true,
            name: 'oranges',
            category: 'Main',
            price: '4.22'
        },
        {
            id: 2,
            date_added: new Date('2100-05-22T16:28:32.615Z'),
            checked: false,
            name: 'ice cream',
            category: 'Snack',
            price: '4.99'
        },
        {
            id: 3, 
            date_added: new Date('1919-12-22T16:28:32.615Z'),
            checked: true, 
            name: 'sliced ham',
            category: 'Lunch',
            price: '7.58'
        }
    ]

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.STEST_DB_URL
        })
    })

    before(() => db('shopping_list').truncate())

    afterEach(() => db('shopping_list').truncate())

    after(() => db.destroy())
    
    
    context(`Given 'shopping_list' has data`, () => {
        beforeEach(() => {
            return db 
                .into('shopping_list')
                .insert(shoppingTestArticles)
        })

        it(`getShoppingList() resolves all items from 'shopping_list' table`, () => {
            // test that ShoppingListService.getShoppingList gets data from table
            return ShoppingListService.getShoppingList(db)
                .then(actual => {
                    expect(actual).to.eql(shoppingTestArticles.map(list => ({
                        ...list, 
                        date_added: new Date(list.date_added)
                    })))
            }) 
        })
    })
    
    context(`Given 'shopping_list' has no data`, () => {
        it(`getShoppingList() resolve an empty array`, () => {
            return ShoppingListService.getShoppingList(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })
    })

    it(`insertItem() inserts an item and resolves the item with an 'id'`, () => {
        const newItem = {
            name: 'Test new name',
            checked: true,
            price: '44.00',
            category: 'Main',
            date_added: new Date('2020-01-01T00:00:00.000Z')
        }
        return ShoppingListService.insertItem(db, newItem)
            .then(actual => {
                expect(actual).to.eql({
                    id: 1,
                    name: newItem.name, 
                    checked: newItem.checked,
                    price: newItem.price, 
                    category: newItem.category, 
                    date_added: new Date(newItem.date_added),
                })
            })
    })

    it(`getById() resolves an item by id from 'shopping_list', table`, () => {
        const idToGet = 3
        const thirdTestItem = shoppingTestArticles[idToGet - 1]
        return ShoppingListService.getById(db, idToGet)
            .then(actual => {
                expect(actual).to.not.eql({
                    id: idToGet,
                    name: thirdTestItem.name, 
                    checked: false,  
                    price: thirdTestItem.price, 
                    category: thirdTestItem.category, 
                    date_added: thirdTestItem.date_added
                })
            })
    })

    it(`deleteItem() removes an item by id from 'shopping_list', table`, () => {
        const itemId = 3
        return ShoppingListService.deleteItem(db, itemId)
            .then(() => ShoppingListService.getShoppingList(db))
            .then(allItems => {
                //copy test items array w.o the "deleted" items
                const expected = shoppingTestArticles.filter(item => item.id !== itemId)
                expect(allItems).to.not.eql(expected)
            })
    })

    it(`updateItem() updates an item from the 'shopping_list', table`, () => {
        const idOfItemToUpdate = 3
        const newItemData = {
            name: 'updated name',
            checked: false,
            price: '33.50',
            category: 'Breakfast',
            date_added: new Date()
        }
        return ShoppingListService.updateItem(db, idOfItemToUpdate, newItemData)
            .then(() => ShoppingListService.getById(db, idOfItemToUpdate))
            .then(item => {
                expect(item).to.not.eql({
                    id: idOfItemToUpdate,
                    ...newItemData
                })
            })
    })
})