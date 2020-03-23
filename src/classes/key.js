const faunadb = require('faunadb');
const q = faunadb.query;


module.exports =(main, id)=> {
    return {
        create(database, role, name, data) {
            main.query = q.CreateKey({
                database: q.Database(database),
                role: role,
                name: name,
                data: data
            });
            return main
        },
    
        all() {
            main.query = q.Paginate(q.Keys());
            return main
        },
    
        get() {
            main.query = q.Get(q.Ref(q.Keys(), id));
            return main
        },
    
        delete() {
            main.query = q.Delete(q.Ref(q.Keys(), id));
            return main
        }
    }
}
