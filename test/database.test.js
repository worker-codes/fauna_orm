const faunadb = require('faunadb');
const q = faunadb.query;
const ORM = require('../src');
let orm = new ORM('fghdfghdfghdfghdfg');

describe('FaunaDB Database', () => {
    test('create database ', () => {
        let fauna_query = q.CreateDatabase({ name:"name" });

        let query = orm.database('name').create();

        expect(fauna_query).toEqual(query.query)
    });

    test('list all database', () => {
        let fauna_query = q.Paginate(q.Databases());

        let query = orm.database().all();

        expect(fauna_query).toEqual(query.query)
    });

    test('get single database' , () => {
        let fauna_query = q.Get(q.Database("name"));

        let query = orm.database("name").get();

        expect(fauna_query).toEqual(query.query)
    });

    test('rename single database' , () => {
        let fauna_query =  q.Update(q.Database("oldName"), { name: "newName" });

        let query = orm.database("oldName").renameTo('newName');

        expect(fauna_query).toEqual(query.query)
    });


    test('delete database', () => {
        let fauna_query = q.Delete(q.Database("name"));

        let query = orm.database("name").delete();
       
        expect(fauna_query).toEqual(query.query);
    });


    test('annotate database', () => {
        let fauna_query = q.Update(q.Database("name"), { data:{key:"value"} });

        let query = orm.database("name").annotate({key:"value"});
       
        expect(fauna_query).toEqual(query.query);
    });
});
