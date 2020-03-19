const faunadb = require('faunadb');
const q = faunadb.query;


module.exports =(main, collection)=> {
    return {
        create(data) {
            if (data.id) {
                let id = data.id
                delete data.id
                main.query = q.Create(q.Ref(q.Collection(collection), id), { data:data })
            }else{
                main.query = q.Create(q.Collection(collection), { data: data });
            }           
            return main;
        },
    
        createMany(documents) {
            main.query = q.Map(documents, q.Lambda('item', q.Create(q.Collection(collection), { data: q.Var('item') })));
            return main;
        },
        all() {
            main.query = q.Paginate(q.Collections());
            return main;
        },
    
        get(id) {
            main.query = q.Get(q.Ref(q.Collection(collection), id));
            return main;
        },
    
        update(id, data) {
            main.query = q.Update(q.Ref(q.Collection(collection), id), { data: { ...data } });
            return main;
        },
    
        replace(id, data) {
            main.query = q.Replace(q.Ref(q.Collection(collection), id), { data: { ...data } });
            return main;
        },
    
        delete(id) {
            main.query = q.Delete(q.Ref(q.Collection(collection), id));
            return main;
        }
    }
}
