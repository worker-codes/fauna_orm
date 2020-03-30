const faunadb = require('faunadb');
const q = faunadb.query;
const { genTermObj, genValueObj } = require('../utils');

function ParseIndex(index){
    return q.Do(
        q.Let(
            {
                "index": index,
                "source":q.Select("source", q.Var("index")),
                "collection":q.Get(q.Var("source")),
                "_id":q.Select("id",q.Select("ref", q.Var("index"))),
            },
            q.Merge(                                            
                {
                    collection: q.Select("name", q.Var("collection")),
                    _id: q.Var("_id"),
                },
                [
                    q.Var("index"),                
                ]
            )                      
        )
    )
}
module.exports =(main, name)=> {
    return {
        create(collection, options) {
            const config = {
                name,
                source: q.Collection(collection),
                unique: (options.unique)? options.unique : false,
                serialized: (options.serialized)? options.serialized : false,
                data: (options.data)? options.data : null,
            };
    
            if (config.terms) config.terms = genTermObj(terms);
            if (config.values) config.values = genValueObj(values);
    
            main.query = ParseIndex(q.CreateIndex(config));
            return main;
        },

        update(name, options={}) {
            main.query = ParseIndex(q.Update(q.Index(name), options));
            return main;
        },
    
        allRef() {           
            main.query = q.Paginate(q.Indexes(), { size:10000 });
            return main;
        },

        all() {           
            main.query = q.Map(
                q.Paginate(q.Indexes(), { size: 10000 }),
                q.Lambda("indexRef",
                    ParseIndex(q.Get(q.Var("indexRef")))                    
                )
            );
            return main;
        },
    
        get() {
            main.query = ParseIndex(q.Get(q.Index(name)))            
            return main;
        },
    
        renameTo(newName) {
            main.query = ParseIndex(q.Update(q.Index(name), { name: newName }));
            return main;
        },
    
        delete() {
            main.query = ParseIndex(q.Delete(q.Index(name)));            
            return main;
        },

        annotate(data) {
            main.query = q.Update(q.Database(name), { data });
            return main;
        }
    }
}
