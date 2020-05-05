const faunadb = require('faunadb');
const _ = require('lodash');
const q = faunadb.query;
const queryBuilder = require('./queryBuilder');

class Count {
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
        
        result = intersection
        this.main.query = q.Count(result) 
		return await this.main.run();
	}
}




module.exports = Count;
