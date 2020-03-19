const faunadb = require('faunadb');
const q = faunadb.query;
const ORM = require('../orm');
let orm = new ORM('fghdfghdfghdfghdfg');

describe('FaunaDB Key', () => {
    test('create key ', () => {
        let fauna_query = q.CreateKey({
            database: q.Database('Db1'),
            role: 'admin',
        });

        let query = orm.key('Db1').create('admin');

        expect(fauna_query).toEqual(query.query)
    });

    test('list all key ', () => {
        let fauna_query = q.Paginate(q.Keys());

        let query = orm.key().all();

        expect(fauna_query).toEqual(query.query)
    });

    test('get single key ', () => {
        let fauna_query = q.Get(q.Ref(q.Keys(), "id"));

        let query = orm.key('id').get();

        expect(fauna_query).toEqual(query.query)
    });

    test('delete key ', () => {
        let fauna_query = q.Delete(q.Ref(q.Keys(), "id"));

        let query = orm.key('id').delete();
       
        expect(fauna_query).toEqual(query.query);
    });
});
