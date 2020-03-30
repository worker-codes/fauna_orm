const faunadb = require('faunadb');
const q = faunadb.query;

function ParseKey(key){
    return q.Do(
        q.Let(
            {
                "key": key,
                "_id":q.Select("id",q.Select("ref", q.Var("key"))),
            },
            q.Merge(                                            
                {
                    _id: q.Var("_id"),
                },
                [
                    q.Var("key"),                
                ]
            )                      
        )
    )
}

module.exports =(main, name)=> {
    return {
        create(options) {

            const config = {
                database: (options.database) ? q.Database(database) : null,
                name: (options.name) ? options.name : null,
                role: (options.role) ? options.role : "admin",
                data: (options.data) ? options.data : null,
            };

            main.query = ParseKey(q.CreateKey(config));
            return main
        },
    
        allRefs() {
            main.query = q.Paginate(q.Keys());
            return main
        },
        all() {
            main.query = q.Map(
                q.Paginate(q.Keys(), { size: 10000 }),
                q.Lambda("keyRef",
                    ParseKey(q.Get(q.Var("keyRef")))                    
                )
            );
            return main
        },    
        get(id) {
            if (!id) {
                throw "Id is required when getting a key"
            }
            main.query = ParseKey(q.Get(q.Ref(q.Keys(), id)));
            return main
        },

        keyFromSecret(secret) {
            if (!secret) {
                throw "secret is required when getting a key"
            } 
            main.query = ParseKey(q.Get(KeyFromSecret(secret)));
            return main
        },
    
        delete(id) {
            if (!id) {
                throw "Id is required when deleting a key"
            }            
            main.query = ParseKey(q.Delete(q.Ref(q.Keys(), id)));
            return main
        }
    }
}