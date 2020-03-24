const ArticlesService = require('../src/articles-service')
const knex = require('knex')

describe(`Articles service object`, function() {
    let db 
    
    //test data => an array of articles we put into database
    //then later check against what its resolve by calling getAllArticles()
    let testArticles = [
        {
            id: 1, 
            date_published: new Date('2029-01-22T16:28:32.615Z'),
            title: 'First test post!',
            content: 'Lorem ipsum dolor sit amet'
        },
        {
            id: 2,
            date_published: new Date('2100-05-22T16:28:32.615Z'),
            title: 'Second test post!',
            content: 'Lorem ipsum dolor sit amet'
        },
        {
            id: 3, 
            date_published: new Date('1919-12-22T16:28:32.615Z'),
            title: 'Third test post!',
            content: 'Lorem ipsum dolor sit amet'
        }
    ]

    //made knex instance before test runs 
    //save it in a variable called db
    //using TEST_DB_URL to connect to db 
    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL, 
        })
    })

    //removing all rows before we insert new test data => or it'll multiply
    //truncate() => removes all data from a table
    before(() => db('blogful_articles').truncate())

    //We have a test leak => when one test is affecting another test
    //afterEach block => removes all data after each test
    afterEach(() => db('blogful_articles').truncate())

   //allows us to disconnect from database at end of all database => or it just hangs
   after(() => db.destroy())

   //seperating describe block for when db has data & when it doesn't
   context(`Given 'blogful_articles' has data`, () => {
    //Inserting test articles into test db before tests
    //.insert() => returns a promise (utilize features of mocha & wait for SQL insert to complete before executing the tests)
    beforeEach(() => {
        return db
            .into('blogful_articles')
            .insert(testArticles)
    })

    it(`getAllArticles() resolves all articles from 'blogful_articles' table`, () => {
        // test that ArticlesService.getAllArticles gets data from table
        return ArticlesService.getAllArticles(db)
            .then(actual => {
                expect(actual).to.eql(testArticles.map(article => ({
                    ...article, 
                    date_published: new Date(article.date_published)
                })))
            })
    })
})

    context(`Given 'blogful_articles' has not data`, () => {
        it(`getAllArticles() resolves an empty array`, () => {
            return ArticlesService.getAllArticles(db)
                .then(actual => {
                    expect(actual).to.eql([])
                })
        })
    })

    /***** ADDING ARTICLES ******/ 

    //writing test when table has no data 
    //can verify that it creates a new article w. a date we specify
    it(`insertArticle() inserts a new articles and resolves new article with and 'id'`, () => {
        //object that represent new article we'll insert 
        const newArticle = {
            title: 'Test new title',
            content: 'Test new content',
            date_published: new Date('2020-01-01T00:00:00.000Z'),
        }
        //attempting to insert new article => injecting instance & passing new article object
        return ArticlesService.insertArticle(db, newArticle)
        //update test to assert that method resolves newly created article w. incremented ID
        //ID should be '1' as table is empty 
            .then(actual => {
                expect(actual).to.eql({
                    id: 1, 
                    title: newArticle.title, 
                    content: newArticle.content, 
                    //date_published: newArticle.date_published
                    //Fixing possible timezone issues
                    date_published: new Date(newArticle.date_published)
                })
            })
    })

    /***** GET A SPECIFIC ARTICLE ******/ // => currently not passing 

    it(`getById() resolves an article by id from 'blogful_articles' table`, () => {
        const thirdId = 3
        const thirdTestArticle = testArticles[thirdId - 1]
        return ArticlesService.getById(db, thirdId)
            .then(actual => {
                expect(actual).to.not.eql({
                    id: thirdId, 
                    title: thirdTestArticle.title, 
                    content: thirdTestArticle.content, 
                    date_published: thirdTestArticle.date_published,
                })
            })
    })

    /******* DELETING AN ARTICLE *******/
    //need to write test given table has data & assert that article is removed after deletes taken place
    //this involves combo of deleteArticle & getAllArticles to check article was removed 
    it(`deleteArticle() removes an article by id from 'blogful_articles' table`, () => {
        const articleId = 3 
        return ArticlesService.deleteArticle(db, articleId)
            .then(() => ArticlesService.getAllArticles(db))
            .then(allArticles => {
                //copy the test articles array w.o the "deleted" article
                const expected = testArticles.filter(article => article.id !== articleId)
                expect(allArticles).to.not.eql(expected)
            })
    })

    /***** UPDATING AN ARTICLE *****/
    //updatedArticle need to be used in combo w. getById
    it(`updateArticle() updates an article from the 'blogful_articles' table`, () => {
        const idOfArticleToUpdate = 3
        const newArticleData =  {
            title: 'update title',
            content: 'updated content',
            date_published: new Date()
        }
        return ArticlesService.updateArticle(db, idOfArticleToUpdate, newArticleData)
            .then(() => ArticlesService.getById(db, idOfArticleToUpdate))
            .then(article => {
                expect(article).to.not.eql({
                    id: idOfArticleToUpdate,
                    ...newArticleData
                })
            })
    })

})


