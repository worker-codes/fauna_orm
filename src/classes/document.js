const faunadb = require('faunadb');
const q = faunadb.query;

function ParseDocument(document){
    return q.Do(
        q.Let(
            {
                "document": document,
                "data": q.Select(["data"], q.Var("document")),
                "_ts": q.Select("ts", q.Var("document")),
                "_id": q.Select("id",q.Select("ref", q.Var("document"))),
            },
            q.Merge(                                            
                {
                    _ts: q.Var("_ts"),
                    _id: q.Var("_id"),
                },
                [
                    q.Var("data"),                
                ]
            )                      
        )
    )
}

module.exports =(main, collection)=> {
    return {
        create(data) {
            if (data._id) {
                let id = data._id
                delete data._id
                main.query = q.Create(q.Ref(q.Collection(collection), id), { data:data })
            }else{
                main.query = q.Create(q.Collection(collection), { data: data });
            }           
            return main;
        },
    
        createMany(documents,ttl=null) {
            main.query = q.Map(
                q.Map(
                    documents, 
                    q.Lambda('item', 
                        q.Create(
                            q.Collection("Comment"), {ttl, data: q.Var('item') }
                        )
                    )
                ),
                Lambda("item",ParseDocument(q.Var("item")))
            ) ;
            return main;
        },

        allRef(options) {

            const config = {               
                size: (options.size) ? options.size : null,
                after: (options.after) ? options.after : null,
                before: (options.before) ? options.before : null,
                ts: (options.ts) ? options.ts : null,
                events: (options.events) ? options.events : null,
                sources: (options.sources) ? options.sources : null,
            };

            main.query = ParseDocument(q.Paginate(q.Documents(q.Collection(collection)), config));
            return main;
        },

        all(options) {

            const config = {               
                size: (options.size) ? options.size : null,
                after: (options.after) ? options.after : null,
                before: (options.before) ? options.before : null,
                ts: (options.ts) ? options.ts : null,
                events: (options.events) ? options.events : null,
                sources: (options.sources) ? options.sources : null,
            };

            main.query = q.Map(
                q.Paginate(q.Documents(q.Collection(collection)), config),
                q.Lambda("collectionRef", 
                    ParseDocument(q.Get(q.Var("collectionRef")))                
                )
            )

            return main;
        },
    
        get(id) {
            main.query = ParseDocument(q.Get(q.Ref(q.Collection(collection), id)));
            return main;
        },
    
        update(id, data, ttl=null) {
            main.query = ParseDocument(q.Update(q.Ref(q.Collection(collection), id), { ttl, data: { ...data } }));
            return main;
        },
    
        replace(id, data, ttl=null) {
            main.query = ParseDocument(q.Replace(q.Ref(q.Collection(collection), id), { ttl, data: { ...data } }));
            return main;
        },
    
        delete(id) {
            main.query = ParseDocument(q.Delete(q.Ref(q.Collection(collection), id)));
            return main;
        },

        setTTL(ttl) {
            main.query = ParseDocument(q.Update(q.Ref(q.Collection(collection), id), { ttl }));
            return main;
        }
    }
}
