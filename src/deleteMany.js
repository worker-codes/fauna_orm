const faunadb = require('faunadb');
const _ = require('lodash');
const q = faunadb.query;
const queryBuilder = require('./queryBuilder');

class DeleteMany {
	constructor(main, name, filter) {
		this.main = main;
		this.name = name;
		this.filter = filter;
		this.isGetDoc = false;
		this.query = {
			viewBy: null,
			filter: filter,
			paginate: {},
			collection: name,
		};
	}
	queryBuilder(statement) {
		return queryBuilder(this.query.collection, this.main.schema[this.query.collection], statement);
	}
	async run() {
		let result = null;
		let intersection;

		if (_.isEmpty(this.query.filter.where)) {
			intersection = q.Intersection(q.Documents(q.Collection(this.name)));
        } else {
			let matches = this.queryBuilder(this.query.filter.where);
			intersection = q.Intersection(...matches);
        }
        
        result = q.Paginate(intersection, { size:1});
        this.main.query = q.Map(
            result,
            q.Lambda(
                'item',
                // q.Delete(q.Var('item'))
                q.Let(
                    {
                        payload: q.Delete(q.Var('item')),
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
                        ]
                    )

                )
            )
        )
		return await this.main.run();
	}
}




module.exports = DeleteMany;
