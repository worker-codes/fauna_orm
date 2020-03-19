const faunadb = require('faunadb');
const q = faunadb.query;
const document = require('./document');
const Where = require('../where');
const Insert = require('../insert');

module.exports = (main, name) => {
	return {
		create() {
			main.query = q.CreateCollection({
				name,
				history_days: 30,
				ttl_days: null,
			});
			return main;
		},
		all() {
			main.query = q.Paginate(q.Collections());
			return main;
		},
		get() {
			main.query = q.Get(q.Collection(name));
			return main;
		},
		renameTo(newName) {
			main.query = q.Update(q.Collection(name), { name: newName });
			return main;
		},
		delete() {
			main.query = q.Delete(q.Collection(name));
			return main;
		},
		document: document(main, name),

		where(filter) {
			return new Where(main, name, filter);
		},
		insert(query) {
			main.query = new Insert(main, name, query);
			return main;
		},
		update(where, query) {
			main.query = new Insert(main, name, query, true);
			return main;
		},
	};
};
