const faunadb = require('faunadb');
const q = faunadb.query;

function queryBuilder(collection, schema, statement) {
	function getIndex(key) {
		return schema.fields[key].indexes.find;
	}
	function getRangeIndex(key) {
		return {
			range: schema.fields[key].indexes.range,
			rangeAll: schema.fields[key].indexes.rangeAll,
		};
	}
	const ops = {
		$eq: (field, value) => {
			let columnIndex = getIndex(field);
			return q.Match(q.Index(columnIndex), value);
		},
		$ne: (field, value) => {
			let columnIndex = getIndex(field);
			return q.Difference(q.Documents(q.Collection(collection)), q.Match(q.Index(columnIndex), value));
		},
		$in: (field, value) => {
			let columnIndex = getIndex(field);
			let ins = value.map(el => q.Match(q.Index(columnIndex), el));

			return q.Union(...ins);
		},
		$nin: (field, value) => {
			let columnIndex = getIndex(field);
			let nins = value.map(el => q.Match(q.Index(columnIndex), el));

			return q.Difference(q.Documents(q.Collection(collection)), q.Union(...nins));
		},
		$range: (field, value) => {
			let rangeIndex = getRangeIndex(field);
			return q.Join(q.Range(q.Match(q.Index(rangeIndex.range)), value[0], value[1]), q.Index(rangeIndex.rangeAll));
		},
		$gte: (field, value) => {
			let rangeIndex = getRangeIndex(field);
			return q.Join(q.Range(q.Match(q.Index(rangeIndex.range)), value, []), q.Index(rangeIndex.rangeAll));
		},
		$lte: (field, value) => {
			let rangeIndex = getRangeIndex(field);
			return q.Join(q.Range(q.Match(q.Index(rangeIndex.range)), [], value), q.Index(rangeIndex.rangeAll));
		},

		/* $gt: (field, value) => value > field,        
        $lt: (field, value) => value < field,
         */
		$not: (field, value) => {
			return q.Difference(q.Documents(q.Collection(collection)), q.Union(...compileFilter(value, field)));
		},

		$and: (field, value) => {
			return q.Intersection(...compileFilter(value));
		},
		$or: (field, value) => {
			return q.Union(...compileFilter(value));
		},
	};

	function compileFilter(filter, field) {
		let query = [];

		if (filter && typeof filter === 'object' && !Array.isArray(filter)) {
			for (const [key, value] of Object.entries(filter)) {
				if (ops[key]) {
					query.push(ops[key](field, value));
				} else {
					if (typeof value === 'object' && value !== null) {
						query.push(q.Union(...compileFilter(value, key)));
					} else {
						let columnIndex = getIndex(key);
						query.push(q.Match(q.Index(columnIndex), value));
					}
				}
			}
		} else if (filter && Array.isArray(filter)) {
			filter.forEach(item => {
				query.push(...compileFilter(item));
			});
		}
		return query;
	}

	return compileFilter(statement);
}

module.exports = queryBuilder;
