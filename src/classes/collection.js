const faunadb = require('faunadb');
const q = faunadb.query;
const document = require('./document');
const FindMany = require('../findMany');
const Insert = require('../insert');
const Delete = require('../Delete');
const DeleteMany = require('../DeleteMany');
const UpdateMany = require('../UpdateMany');
const Count = require('../count');
const index = require('../classes/index_collection');

function ParseCollection(collection){
    return q.Do(
        q.Let(
            {
                "collection": collection,
                "_id":q.Select("id",q.Select("ref", q.Var("collection"))),
            },
            q.Merge(                                            
                {
                    _id: q.Var("_id"),
                },
                [
                    q.Var("collection"),                
                ]
            )                      
        )
    )
}

module.exports = (main, name) => {
	return {
		create(options) {

            const config = {               
                ttl_days: (options.ttl_days) ? options.ttl_days : null,
                history_days: (options.history_days) ? options.history_days : null,
                data: (options.data) ? options.data : null,
                permissions: (options.permissions) ? options.permissions : null,
            };

			main.query = q.Paginate(
                q.CreateCollection({
                    name,
                    ...config
                })
            );
			return main;
        },
        allRef() {
			main.query = q.Paginate(q.Collections());
			return main;
		},
		all() {
            main.query = q.Map(
                q.Paginate(q.Collections(), { size:10000 }),
                q.Lambda("collectionRef", 
                    ParseKey(q.Get(q.Var("collectionRef")))                
                )
            )
			return main;
		},
		get() {
            main.query = ParseCollection(q.Get(q.Collection(name)));           
			return main;
        },

        change(options) {
            const config = {               
                name: (options.name) ? options.name : null,
                ttl_days: (options.ttl_days) ? options.ttl_days : null,
                history_days: (options.history_days) ? options.history_days : null,
                data: (options.data) ? options.data : null,
                permissions: (options.permissions) ? options.permissions : null,
            };

			main.query = ParseCollection(q.Update(q.Collection(name), { ...config }));
			return main;
        },

		renameTo(newName) {
			main.query = ParseCollection(q.Update(q.Collection(name), { name: newName }));
			return main;
        },
        setTTL(days) {
            main.query = ParseCollection(q.Update(q.Database(name), { ttl_days:days }));
            return main;
        },
        setHistory(days) {
            main.query = ParseCollection(q.Update(q.Database(name), { history_days:days }));
            return main;
        },
        setPermissions(permissions) {
            main.query = ParseCollection(q.Update(q.Database(name), { permissions:permissions }));
            return main;
        },
        annotate(data) {
            main.query = ParseCollection(q.Update(q.Database(name), { data }));
            return main;
        },
		delete() {
			main.query = ParseCollection(q.Delete(q.Collection(name)));
			return main;
		},
        document: document(main, name),
        
        index: index(main, name),
        query:{
            findOne(filter) {
                return new FindMany(main, name, filter);
            },
            findMany(filter) {
                return new FindMany(main, name, filter);
            },
            create(query) {
                main.query = new Insert(main, name, query);
                return main;
            },
            update(query) {
                main.query = new Insert(main, name, query, true);
                return main;
            },
            upsert(query) {
                main.query = new Insert(main, name, query, true);
                return main;
            },
            delete(query) {//
                return new Delete(main, name, query, true);
            },
            updateMany(query) {//
                return new UpdateMany(main, name, query, true);
            },
            deleteMany(query) {//
                return new DeleteMany(main, name, query);
            },
            count(filter) {//
                return new Count(main, name, filter);
            },
        }		
	};
};
