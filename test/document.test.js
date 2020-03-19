const faunadb = require('faunadb');
const q = faunadb.query;
const ORM = require('../src');
let orm = new ORM('fghdfghdfghdfghdfg');

describe('FaunaDB Document', () => {
    test('create document ', () => {
        let fauna_query = q.Create(q.Collection("collection"), { data: { key:"value" } });

        let query = orm.collection("collection").document.create({ key:"value" });

        expect(fauna_query).toEqual(query.query)
    });

    test('create document with id ', () => {
        let fauna_query = q.Create(q.Ref(q.Collection("collection"), "11111"), { data:{key:"value" }})

        let query = orm.collection("collection").document.create({ id:"11111", key:"value" });

        expect(fauna_query).toEqual(query.query)
    });

    test('create many document ', () => {
        let fauna_query = q.Map([{ key:"value" },{ key2:"value2" }], q.Lambda('item', q.Create(q.Collection("collection"), { data: q.Var('item') })));

        let query = orm.collection("collection").document.createMany([{ key:"value" },{ key2:"value2" }]);

        expect(fauna_query).toEqual(query.query)
    });

    test('list all document', () => {
        let fauna_query = q.Paginate(q.Collections());

        let query = orm.collection("collection").document.all();

        expect(fauna_query).toEqual(query.query)
    });

    test('get single document' , () => {
        let fauna_query = q.Get(q.Ref(q.Collection("collection"), "id"));

        let query = orm.collection("collection").document.get('id');

        expect(fauna_query).toEqual(query.query)
    });

    test('update single document' , () => {
        let fauna_query = q.Update(q.Ref(q.Collection("collection"), "id"), { data: { key:"value" } });

        let query = orm.collection("collection").document.update('id', { key:"value" });

        expect(fauna_query).toEqual(query.query)
    });

    test('replace single document' , () => {
        let fauna_query = q.Replace(q.Ref(q.Collection("collection"), "id"), { data: { key:"value" } });

        let query = orm.collection("collection").document.replace('id', { key:"value" });

        expect(fauna_query).toEqual(query.query)
    });

    test('delete document', () => {
        let fauna_query = q.Delete(q.Ref(q.Collection("collection"), "id"));;

        let query = orm.collection("collection").document.delete('id');
       
        expect(fauna_query).toEqual(query.query);
    });

    test('create a connection' , () => {
        let fauna_query = q.Update(q.Ref(q.Collection("collection"), "id"), { data: { connection:q.Ref(q.Collection("Customer"), "240811682315633159") } });

        let query = orm.collection("collection").document.update('id', { connection:q.Ref(q.Collection("Customer"), "240811682315633159") });

        expect(fauna_query).toEqual(query.query)
    });
});
