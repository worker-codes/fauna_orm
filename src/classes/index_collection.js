const faunadb = require('faunadb');
const q = faunadb.query;
const { genTermObj, genValueObj } = require('../utils');

module.exports =(main, collection)=> {
    return {
        create(name, terms, values, unique = false) {
            const config = {
                name,
                source: q.Collection(collection),
                unique,
            };
    
            if (terms) config.terms = genTermObj(terms);
            if (values) config.values = genValueObj(values);
    
            main.query = q.CreateIndex(config);
            return main;
        },   
        get() {
            main.query = q.Filter(
                q.Map(
                    q.Paginate(q.Indexes(), { size: 10000 }),
                    q.Lambda("indexRef",
                        q.Let(
                            {
                                "index": q.Get(q.Var("indexRef")),
                                "source":q.Select("source", q.Var("index")),
                                "collection":q.Get(q.Var("source")),
                                "_id":q.Select("id",q.Select("ref", q.Var("index"))),
                            },
                            q.Merge(                                            
                                {
                                    collection: q.Select(collection, q.Var("collection")),
                                    _id: q.Var("_id"),
                                },
                                [
                                    q.Var("index"),
                                    
                                ]
                            )                      
                        )
                    )
                ),
                q.Lambda("index", q.Equals(collection, q.Select("collection", q.Var("index"))) )
            );
            return main;
        },
        deleteAll() {
            main.query = q.Filter(
                q.Paginate(q.Indexes(), { size: 10000 }),
                q.Lambda("indexRef",
                q.Let(
                        {
                            "index": q.Get(q.Var("indexRef")),
                             "source":q.Select("source", q.Var("index")),
                             "collection":q.Get(q.Var("source"))
                        },
                        q.If( 
                          Equals(collection, q.Select("name", q.ar("collection"))),
                          q.Do(
                            q.Delete(q.Var("indexRef")),
                            true,
                          ),
                          false
                        )
                    )
                )
            );
            return main;
        }
    }
}
