const faunadb = require('faunadb');
const _ = require('lodash');
const q = faunadb.query;
const queryBuilder = require('./queryBuilder');

class Where {
	constructor(main, name, filter) {
		this.main = main;
		this.name = name;
		this.filter = filter;
		this.isGetDoc = false;
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
		// console.log( this.main.schema[this.query.collection].views[view].columns.length );

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
	queryBuilder(statement) {
		return queryBuilder(this.query.collection, this.main.schema[this.query.collection], statement);
	}
	async run() {
		let result = null;
		let intersection;

		if (_.isEmpty(this.query.filter)) {
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
							},
							q.Merge(
								q.Select('data', q.Var('payload')),
								{
									_id: q.Select('id', q.Select('ref', q.Var('payload'))),
									_ts: q.Select('ts', q.Var('payload')),
								}
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

		return await this.main.run();
	}
}

module.exports = Where;
