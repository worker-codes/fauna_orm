const faunadb = require('faunadb');
const _ = require('lodash');
const q = faunadb.query;
const queryBuilder = require('./queryBuilder');

function Relation(index, parentRef, child = null) {
    return q.Select(["data"][0],
        q.Map(
            q.Paginate(q.Match(q.Index(index), q.Var(parentRef)),{ size: 1000}),
            q.Lambda("itemRef",
                q.Let(
                    {
                        "item": q.Get(q.Var("itemRef")),
                        "data":q.Select(["data"], q.Var("item")),
                        "_ts":q.Select(["ts"], q.Var("item")),
                        "_id":q.Select("id",q.Select("ref", q.Var("item"))),
                    },
                    q.Merge(                                            
                        {
                            _ts: q.Var("_ts"),
                            _id: q.Var("_id"),
                        },
                        [
                            q.Var("data"),
                            {
                                ...child
                            }
                        ]
                    )                            
                )
            )
        ) 
    )
}

class FindMany {
	constructor(main, name, filter) {
		this.main = main;
		this.name = name;
		this.filter = filter;
		this.isGetDoc = false;
		this.relationQuery = {};
		this.viewRefPosition = null;

		this.query = {
			viewBy: null,
			filter: filter,
			paginate: {},
			collection: name,
		};
	}
	viewBy(view) {
		let viewIndex = this.main.schema[this.query.collection].views[view].index;
		this.viewRefPosition = this.main.schema[this.query.collection].views[view].columns;
        this.query['viewBy'] = viewIndex;
        
		return this;
	}
	limit(size) {
		this.query.paginate['size'] = size;
		return this;
	}
	after(position) {
		this.query.paginate['after'] = q.Ref(q.Collection(this.name), position);
		return this;
	}
	before(position) {
		this.query.paginate['before'] = q.Ref(q.Collection(this.name), position);
		return this;
	}
	getDoc() {
		this.isGetDoc = true;
		return this;
	}
	events(position) {
		this.query.paginate['events'] = position;
		return this;
    }
    include(notation) {
        this.relationQuery =this.withGraphFetched(notation, this.query.collection, "x")
        return this
    }
    withGraphFetched(notation, collection, parent=null) {

    
        // let collection ="Customer"
    
        let model = this.main.schema[collection];
        let relations = Object.keys(model.relations);
        let query = {};
    
        for (const [key, value] of Object.entries(notation)) {
    
            if (typeof value === 'object' && relations.includes(key)) {
    
                let relationCollection =  model.relations[key].collection
                let index =  model.relations[key].index
                // console.log(index);
                let child = this.withGraphFetched(value, relationCollection, "itemRef");
    
                query[key] = Relation(index, parent, child)
    
            } else if (value && relations.includes(key)) {
    
                let index =  model.relations[key].index
                query[key] = Relation(index, parent)
                // console.log(index);
                
            }
        }
    
        return query  
    }
	queryBuilder(statement) {
		return queryBuilder(this.query.collection, this.main.schema[this.query.collection], statement);
	}
	async run() {
		let result = null;
		let intersection;

		if (_.isEmpty(this.query.filter)) {
			intersection = q.Intersection(q.Documents(q.Collection(this.name)));
        } else if (_.isEmpty(this.query.filter)) {
			intersection = q.Intersection(q.Documents(q.Collection(this.name)));
		} else {
			let matches = this.queryBuilder(this.query.filter);
			intersection = q.Intersection(...matches);
		}

		if (this.query.viewBy) {
			result = q.Paginate(q.Join(intersection, q.Index(this.query.viewBy)), this.query.paginate);
		} else {
			result = q.Paginate(intersection, this.query.paginate);
		}
		if (this.isGetDoc) {
			if (this.query.viewBy) {
				let columns = {};
				this.viewRefPosition.forEach((col, index) => {
					columns[col] = q.Select(index, q.Var('payload'));
				});

				columns['_id'] = q.Select('id', q.Select(this.viewRefPosition.length, q.Var('payload')));

				this.main.query = q.Map(
					result,
					q.Lambda(
						'x',
						q.Let(
							{
								payload: q.Var('x'),
							},
							columns
						)
					)
				);
			} else {
				this.main.query = q.Map(
					result,
					q.Lambda(
						'x',
						q.Let(
							{
                                payload: q.Get(q.Var('x')),
                                "data":q.Select(["data"], q.Var("payload")),
                                "_ts":q.Select(["ts"], q.Var("payload")),
                                "_id":q.Select("id",q.Select("ref", q.Var("payload"))),
							},
							q.Merge(
                                {
                                    _ts: q.Var("_ts"),
                                    _id: q.Var("_id"),
                                },
                                [
                                    q.Var("data"),
                                    this.relationQuery                                    
                                ]
								// q.Select('data', q.Var('payload')),
								// {
								// 	_id: q.Select('id', q.Select('ref', q.Var('payload'))),
								// 	_ts: q.Select('ts', q.Var('payload')),
								// }
								// q.Select("id",q.Select("ref", q.Var("customer")))
							)
							/* {
                            data:q.Select("data", q.Var("customer"))
                        } */
						)
					)
				);
			}
		} else {
			this.main.query = result;
        }
        
        // console.log("??????????????????????????????????????");
        

		return await this.main.run();
	}
}




module.exports = FindMany;
