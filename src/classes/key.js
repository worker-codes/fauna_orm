const faunadb = require('faunadb');
const q = faunadb.query;


module.exports =(main, name)=> {
    return {
        create(role) {
            main.query = q.CreateKey({
                database: q.Database(name),
                role: role,
            });
            return main
        },
    
        all() {
            main.query = q.Paginate(q.Keys());
            return main
        },
    
        get() {
            main.query = q.Get(q.Ref(q.Keys(), name));
            return main
        },
    
        delete() {
            main.query = q.Delete(q.Ref(q.Keys(), name));
            return main
        }
    }
}
