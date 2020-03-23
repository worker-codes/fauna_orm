const faunadb = require('faunadb');
const q = faunadb.query;
const ORM = require('../src');
let orm = new ORM('fghdfghdfghdfghdfg');

describe('FaunaDB Index', () => {
    test('create index ', () => {
        let fauna_query = q.CreateIndex({
            name: 'mike',
            source: q.Class('collection'),
            unique: false,
        });

        let query = orm.index('mike').create('collection');

        expect(fauna_query).toEqual(query.query)
    });

    test('create index with terms ', () => {
        let fauna_query = q.CreateIndex({
            name: 'mike',
            source: q.Class('collection'),
            unique: false,
            terms: [
                { field: ['data', "email"] },
                { field: ['data', "name"] },
                { field: ['data', "address.city"] },
            ]
        });

        let query = orm.index('mike').create('collection',["email", "name", "address.city"]);

        expect(fauna_query).toEqual(query.query)
    });

    test('create index with terms, ref and ts', () => {
        let fauna_query = q.CreateIndex({
            name: 'mike',
            source: q.Class('collection'),
            unique: false,
            terms: [
                { field: ['data', "email"] },
                { field: ['ref'] },
                { field: ['ts'] },
            ]
        });

        let query = orm.index('mike').create('collection',["email", "ref", "ts"]);

        expect(fauna_query).toEqual(query.query)
    });

    test('create index with values ', () => {
        let fauna_query = q.CreateIndex({
            name: 'mike',
            source: q.Class('collection'),
            unique: false,
            values: [
                { field: ['data', "email"] },
                { field: ['data', "name"] },
                { field: ['data', "address.city"] },
            ]
        });

        let query = orm.index('mike').create('collection', null, ["email", "name", "address.city"]);

        expect(fauna_query).toEqual(query.query)
    });

    test('create index with values with ref ', () => {
        let fauna_query = q.CreateIndex({
            name: 'mike',
            source: q.Class('collection'),
            unique: false,
            values: [
                { field: ['data', "email"] },
                { field: ['ref'] },
            ]
        });

        let query = orm.index('mike').create('collection', null, ["email", "ref"]);

        expect(fauna_query).toEqual(query.query)
    });

    test('create index with values with ts ', () => {
        let fauna_query = q.CreateIndex({
            name: 'mike',
            source: q.Class('collection'),
            unique: false,
            values: [
                { field: ['data', "email"] },
                { field: ['ts'] },
            ]
        });

        let query = orm.index('mike').create('collection', null, ["email", "ts"]);

        expect(fauna_query).toEqual(query.query)
    });

    test('create unique index', () => {
        let fauna_query = q.CreateIndex({
            name: 'mike',
            source: q.Class('collection'),
            unique: true,
            terms: [{ field: ['data', "email"] }]
        });

        let query = orm.index('mike').create('collection', "email", null , true);

        expect(fauna_query).toEqual(query.query)
    });

    test('list all index ', () => {
        let fauna_query = q.Paginate(q.Indexes());

        let query = orm.index().all();

        expect(fauna_query).toEqual(query.query)
    });

    test('get single index ', () => {
        let fauna_query = q.Get(q.Index('name'));

        let query = orm.index('name').get();

        expect(fauna_query).toEqual(query.query)
    });

    test('rename index index ', () => {
        let fauna_query = q.Update(q.Index('oldName'), { name: 'newName' });

        let query = orm.index('oldName').renameTo('newName');

        expect(fauna_query).toEqual(query.query)
    });

    test('delete index index ', () => {
        let fauna_query = q.Delete(q.Index('mike'));

        let query = orm.index('mike').delete();
       
        expect(fauna_query).toEqual(query.query);
    });
});
