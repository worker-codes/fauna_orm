const faunadb = require('faunadb');
const _ = require('lodash');
const q = faunadb.query;
const queryBuilder = require('./queryBuilder');

function Relation(indexes, child = null) {
	let matches = [];
	indexes.forEach(index => {
		matches.push(q.Match(q.Index(index), q.Var('parent')));
	});
	if (child) {
		return q.Lambda('parent', q.Join(q.Union(q.Singleton(q.Var('parent')), ...matches), child));
	} else {
		return q.Lambda('parent', q.Union(q.Singleton(q.Var('parent')), ...matches));
	}
}

class Delete {
	constructor(main, name, filter) {
		this.main = main;
		this.name = name;
		this.filter = filter;
		this.relationQuery = {};

		this.query = {
			filter: filter,
			paginate: {},
			collection: name,
		};
	}
	withRelation(notation) {
		this.relationQuery = this.withGraphFetched(notation, this.query.collection, 'x');
		return this;
	}
	withGraphFetched(notation, collection, parent = null) {
		let model = this.main.schema[collection];
		let relations = Object.keys(model.relations);
		let child = null;
		let indexes = [];

		for (const [key, value] of Object.entries(notation)) {
			if (typeof value === 'object' && relations.includes(key)) {
				let relationCollection = model.relations[key].collection;
				let index = model.relations[key].index;
				let collection = model.relations[key].collection;
				let edgeCollection = model.relations[key].at;
				let edge = this.main.schema[edgeCollection];
				let edgeIndex = '';

				if (collection === edge.fields.fromRef.collection) {
					edgeIndex = edge.fields.fromRef.indexes.find;
				} else if (collection === edge.fields.toRef.collection) {
					edgeIndex = edge.fields.toRef.indexes.find;
				}

				indexes.push(index);
				indexes.push(edgeIndex);
				child = this.withGraphFetched(value, relationCollection);

			} else if (value && relations.includes(key)) {
				let index = model.relations[key].index;
				let collection = model.relations[key].collection;
				let edgeCollection = model.relations[key].at;
				let edge = this.main.schema[edgeCollection];
				let edgeIndex = '';

				if (collection === edge.fields.fromRef.collection) {
					edgeIndex = edge.fields.fromRef.indexes.find;
				} else if (collection === edge.fields.toRef.collection) {
					edgeIndex = edge.fields.toRef.indexes.find;
				}
				indexes.push(index);
				indexes.push(edgeIndex);
			}
		}

		return Relation(indexes, child);
	}
	queryBuilder(statement) {
		return queryBuilder(this.query.collection, this.main.schema[this.query.collection], statement);
	}
	async run() {
		//console.dir(this.relationQuery, { depth: null });

		let result = null;

		result = q.Map(
			q.Paginate(
                q.Join(
                    q.Union(
                        q.Singleton(q.Ref(q.Collection(this.name), this.query.filter))
                    ), 
                    this.relationQuery
                ),
                { size: 100000 }
            ),
			q.Lambda(
				'item',
				q.Let(
					{
						payload: q.Delete(q.Var('item')),
						data: q.Select(['data'], q.Var('payload')),
						_ts: q.Select(['ts'], q.Var('payload')),
						_id: q.Select('id', q.Select('ref', q.Var('payload'))),
					},
					q.Merge(
						{
							_ts: q.Var('_ts'),
							_id: q.Var('_id'),
						},
						[q.Var('data')]
					)
				)
			)
		);
		this.main.query = result;

		return await this.main.run();
	}
}

module.exports = Delete;
