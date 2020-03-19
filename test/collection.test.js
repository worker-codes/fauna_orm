const faunadb = require('faunadb');
const q = faunadb.query;
const ORM = require('../orm');
let orm = new ORM('fghdfghdfghdfghdfg');

describe('FaunaDB Collection', () => {
    test('create collection ', () => {
        let fauna_query = q.CreateCollection({
            name:"name",
            history_days: 30,
            ttl_days: null,
        });

        let query = orm.collection('name').create();

        expect(fauna_query).toEqual(query.query)
    });

    test('list all collection', () => {
        let fauna_query = q.Paginate(q.Collections());

        let query = orm.collection().all();

        expect(fauna_query).toEqual(query.query)
    });

    test('get single collection' , () => {
        let fauna_query = q.Get(q.Collection("name"));

        let query = orm.collection("name").get();

        expect(fauna_query).toEqual(query.query)
    });

    test('rename single collection' , () => {
        let fauna_query =  q.Update(q.Collection("oldName"), { name: "newName" });

        let query = orm.collection("oldName").renameTo('newName');

        expect(fauna_query).toEqual(query.query)
    });


    test('delete collection', () => {
        let fauna_query = q.Delete(q.Collection("name"));

        let query = orm.collection("name").delete();
       
        expect(fauna_query).toEqual(query.query);
    });
});
