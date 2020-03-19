const faunadb = require('faunadb');
const q = faunadb.query;


module.exports =(main, name)=> {
    return {
        create() {
            main.query = q.CreateDatabase({ name });
            return main;
        },
        
        get() {
            main.query = q.Get(q.Database(name));
            return main;
        },
        
        all() {
            main.query = q.Paginate(q.Databases());
            return main;
        },
        
        renameTo(newName) {
            main.query = q.Update(q.Database(name), { name: newName });
            return main;
        },
        
        delete() {
            main.query = q.Delete(q.Database(name));
            return main;
        },
        
        annotate(data) {
            main.query = q.Update(q.Database(name), { data });
            return main;
        }
    }
}
