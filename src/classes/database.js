const faunadb = require('faunadb');
const q = faunadb.query;


module.exports =(main, name)=> {
    return {
        create(data= null) {
            main.query = q.CreateDatabase({ name, data});
            return main;
        },
        
        get() {
            main.query = q.Get(q.Database(name));
            return main;
        },
        
        all() {
            main.query = q.Map(
                q.Paginate(q.Databases(), { size:10000 }),
                q.Lambda("databaseRef", q.Get(q.Var("databaseRef")))
            )
            return main;
        },

        allRefs() {
            main.query = q.Paginate(q.Databases(), { size:10000 });
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
