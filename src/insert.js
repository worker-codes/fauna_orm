const _ = require('lodash');
const { snowId } = require('./utils');
const faunadb = require('faunadb');
const q = faunadb.query;

class Insert {
	constructor(main, model, query, isUpdate = false) {
		this.main = main;
		this.isUpdate = isUpdate;
		this.query = query;
		this.querySql = [];

		this.relationBuilder(this.query, model, null, isUpdate);
		console.dir(this.query, { depth: null });

		this.buildQuery(this.query, null, isUpdate);
		return q.Do(this.querySql);
	}
	relationBuilder(doc, ModelName, owner = null, isUpdate = false) {
		let relation;
		let parent;
		let model = this.main.schema[ModelName];

		let relationsKey = Object.keys(model.relations);
		let id;

		if (isUpdate) {
			relation = _.pick(doc.data, relationsKey);

			id = doc.where.id;

			parent = {
				collection: ModelName,
				id: '' + id,
			};

			doc['$___Model'] = ModelName;

			if (owner) {
				doc['$___Owner'] = owner;
			}

			doc['$___BelongsTo'] = {};
		} else {
			relation = _.pick(doc, relationsKey);

			if (doc.id) {
				id = doc['id'];
			} else {
				id = snowId();
				doc['id'] = id;
			}

			parent = {
				collection: ModelName,
				id: '' + id,
			};

			doc['$___Model'] = ModelName;

			if (owner) {
				doc['$___Owner'] = owner;
			}

			doc['$___BelongsTo'] = {};
		}

		for (const [key, value] of Object.entries(relation)) {
			let relation = model.relations[key];
			if (relation) {
				if (value.create) {
					if (relation.relationType === 'BelongsTo') {
						if (typeof value.create === 'object') {
							let childid = this.relationBuilder(value.create, relation.collection, parent);
							doc['$___BelongsTo'][key] = q.Ref(q.Collection(relation.collection), '' + childid);
						}
					} else {
						if (Array.isArray(value.create)) {
							value.create.map(n => {
								this.relationBuilder(n, relation.collection, parent);
							});
						} else if (typeof value.create === 'object') {
							this.relationBuilder(value.create, relation.collection, parent);
						}
					}
				}

				if (value.update) {
					if (relation.relationType === 'BelongsTo') {
						if (typeof value.update === 'object') {
							let childid = this.relationBuilder(value.update, relation.collection, parent, true);
							doc['$___BelongsTo'][key] = q.Ref(q.Collection(relation.collection), '' + childid);
						}
					} else {
						if (Array.isArray(value.update)) {
							value.update.map(n => {
								this.relationBuilder(n, relation.collection, parent, true);
							});
						} else if (typeof value.update === 'object') {
							this.relationBuilder(value.update, relation.collection, parent, true);
						}
					}
				}
				if (value.connect) {
					if (relation.relationType === 'BelongsTo') {
						if (typeof value.connect === 'object') {
							let childid = this.relationBuilder(value.connect, relation.collection, parent);
							doc['$___BelongsTo'][key] = q.Ref(q.Collection(relation.collection), '' + childid);
						}
					} else {
						if (Array.isArray(value.connect)) {
							value.connect.map(n => {
								this.relationBuilder(n, relation.collection, parent);
							});
						} else if (typeof value.connect === 'object') {
							this.relationBuilder(value.connect, relation.collection, parent);
						}
					}
				}

				if (value.disconnect) {
					if (relation.relationType === 'BelongsTo') {
						if (typeof value.disconnect === 'object') {
							let childid = this.relationBuilder(value.disconnect, relation.collection, parent);
							doc['$___BelongsTo'][key] = q.Ref(q.Collection(relation.collection), '' + childid);
						}
					} else {
						if (Array.isArray(value.disconnect)) {
							value.disconnect.map(n => {
								this.relationBuilder(n, relation.collection, parent);
							});
						} else if (typeof value.disconnect === 'object') {
							this.relationBuilder(value.disconnect, relation.collection, parent);
						}
					}
				}

				if (value.delete) {
					if (relation.relationType === 'BelongsTo') {
						if (typeof value.delete === 'object') {
							let childid = this.relationBuilder(value.delete, relation.collection, parent);
							doc['$___BelongsTo'][key] = q.Ref(q.Collection(relation.collection), '' + childid);
						}
					} else {
						if (Array.isArray(value.delete)) {
							value.delete.map(n => {
								this.relationBuilder(n, relation.collection, parent);
							});
						} else if (typeof value.delete === 'object') {
							this.relationBuilder(value.delete, relation.collection, parent);
						}
					}
				}
			}
		}

		return id;
	}

	buildQuery(doc, relationModel = null, update = false) {
		let model = this.main.schema[doc.$___Model];

		let relationsKey = Object.keys(model.relations);
		let documentsToInsert;
		let relations;

		if (update) {
			documentsToInsert = _.omit(doc.data, [...relationsKey, '$___Model', '$___BelongsTo', '$___Owner']);
			relations = _.pick(doc.data, relationsKey);
		} else {
			documentsToInsert = _.omit(doc, [...relationsKey, '$___Model', '$___BelongsTo', '$___Owner']);
			relations = _.pick(doc, relationsKey);
		}

		if (doc.$___Owner) {
			if (update) {
				if (doc.$___BelongsTo) {
					documentsToInsert = {
						...documentsToInsert,
						...doc.$___BelongsTo,
					};
				}
				this.update(doc.$___Model, doc.where.id, documentsToInsert);
			} else {
				if (relationModel.relationType === 'HasMany') {
					let newprop = relationModel.at.field;
					// documentsToInsert[newprop] = doc.$___Owner
					documentsToInsert[newprop] = q.Ref(q.Collection(doc.$___Owner.collection), '' + doc.$___Owner.id);
				} else if (relationModel.relationType === 'HasManyThrough') {
					let then = relationModel.at.then;
					let newprop = relationModel.at.field;

					this.create(relationModel.at.collection, {
						[then]: q.Ref(q.Collection(doc.$___Owner.collection), '' + doc.$___Owner.id),
						[newprop]: q.Ref(q.Collection(relationModel.collection), '' + doc.id),
					});
				}
				if (doc.$___BelongsTo) {
					documentsToInsert = {
						...documentsToInsert,
						...doc.$___BelongsTo,
					};
				}

				this.create(doc.$___Model, documentsToInsert);
			}
		} else {
			if (update) {
				if (doc.$___BelongsTo) {
					documentsToInsert = {
						...documentsToInsert,
						...doc.$___BelongsTo,
					};
				}
				this.update(doc.$___Model, doc.where.id, documentsToInsert);
			} else {
				this.create(doc.$___Model, documentsToInsert);
			}
		}

		for (const [key, value] of Object.entries(relations)) {
			let _relation = model.relations[key];
			if (_relation) {
				if (value.create) {
					if (Array.isArray(value.create)) {
						value.create.map(n => {
							this.buildQuery(n, _relation);
						});
					} else if (typeof value.create === 'object') {
						this.buildQuery(value.create, _relation);
					}
				}
				if (value.update) {
					if (Array.isArray(value.update)) {
						value.update.map(n => {
							this.buildQuery(n, _relation, true);
						});
					} else if (typeof value.update === 'object') {
						this.buildQuery(value.update, _relation, true);
					}
				}
				if (value.connect) {
					let newprop = _relation.at.field;
					let collection = _relation.at.collection;
					if (Array.isArray(value.connect)) {
						value.connect.map(n => {
							if (_relation.relationType === 'HasMany') {
								this.connect(collection, n.id, {
									[newprop]: q.Ref(q.Collection(n.$___Owner.collection), '' + n.$___Owner.id),
								});
							} else if (_relation.relationType === 'HasManyThrough') {
								let then = _relation.at.then;

								this.create(collection, {
									[then]: q.Ref(q.Collection(value.connect.$___Owner.collection), '' + value.connect.$___Owner.id),
									[newprop]: q.Ref(q.Collection(_relation.collection), '' + value.connect.id),
								});
							}
						});
					} else if (typeof value.connect === 'object') {
						if (_relation.relationType === 'HasMany') {
							this.connect(collection, value.connect.id, {
								[newprop]: q.Ref(q.Collection(value.connect.$___Owner.collection), '' + value.connect.$___Owner.id),
							});
						} else if (_relation.relationType === 'HasManyThrough') {
							let then = _relation.at.then;

							this.create(collection, {
								[then]: q.Ref(q.Collection(value.connect.$___Owner.collection), '' + value.connect.$___Owner.id),
								[newprop]: q.Ref(q.Collection(_relation.collection), '' + value.connect.id),
							});
						}
					}
				}

				if (value.disconnect) {
					let newprop = _relation.at.field;
					let collection = _relation.at.collection;
					if (Array.isArray(value.disconnect)) {
						value.disconnect.map(n => {
							if (_relation.relationType === 'BelongsTo') {
								this.disconnect(n.$___Owner.collection, n.$___Owner.id, {
									[newprop]: null,
								});
							} else if (_relation.relationType === 'HasMany') {
								this.disconnect(collection, n.id, {
									[newprop]: null,
								});
							} else if (_relation.relationType === 'HasManyThrough') {
								let index = this.main.schema[_relation.at.collection].index;
								let terms = this.main.schema[_relation.at.collection].terms;
								let then = _relation.at.then;

								if ([then, newprop].toString() === terms.toString()) {
									this.disconnectThrough(index, [n.$___Owner.id, n.id]);
								} else if ([then, newprop].toString() === terms.toString()) {
									this.disconnectThrough(index, [n.id, n.$___Owner.id]);
								} else {
									throw 'no matching terms';
								}
							}
						});
					} else if (typeof value.disconnect === 'object') {
						if (_relation.relationType === 'BelongsTo') {
							this.disconnect(value.disconnect.$___Owner.collection, value.disconnect.$___Owner.id, {
								[newprop]: null,
							});
						} else if (_relation.relationType === 'HasMany') {
							this.disconnect(collection, value.disconnect.id, {
								[newprop]: null,
							});
						} else if (_relation.relationType === 'HasManyThrough') {
							let index = this.main.schema[_relation.at.collection].index;
							let terms = this.main.schema[_relation.at.collection].terms;
							let then = _relation.at.then;

							if ([then, newprop].toString() === terms.toString()) {
								this.disconnectThrough(index, [value.disconnect.$___Owner.id, value.disconnect.id]);
							} else if ([then, newprop].toString() === terms.toString()) {
								this.disconnectThrough(index, [value.disconnect.id, value.disconnect.$___Owner.id]);
							} else {
								throw 'no matching terms';
							}
						}
					}
				}

				if (value.delete) {
					let newprop = _relation.at.field;
					let collection = _relation.at.collection;
					if (Array.isArray(value.delete)) {
						value.delete.map(n => {
							if (_relation.relationType === 'BelongsTo') {
								this.disconnect(n.$___Owner.collection, n.$___Owner.id, {
									[newprop]: null,
								});
								this.delete(n.$___Model, n.id);
							} else if (_relation.relationType === 'HasMany') {
								this.delete(collection, n.id);
							} else if (_relation.relationType === 'HasManyThrough') {
								let property = _relation.at.field;
								let index = this.main.schema[_relation.at.collection].relations[property].index;

								this.disconnectThrough(index, n.$___Owner.id);
							}
						});
					} else if (typeof value.delete === 'object') {
						if (_relation.relationType === 'BelongsTo') {
							this.disconnect(value.delete.$___Owner.collection, value.delete.$___Owner.id, {
								[newprop]: null,
							});

							this.delete(value.delete.$___Model, value.delete.id);
						} else if (_relation.relationType === 'HasMany') {
							this.delete(collection, value.delete.id);
						} else if (_relation.relationType === 'HasManyThrough') {
							this.delete(value.delete.$___Model, value.delete.id);

							let index = this.main.schema[_relation.at.collection].index;
							let terms = this.main.schema[_relation.at.collection].terms;
							let then = _relation.at.then;

							if ([then, newprop].toString() === terms.toString()) {
								this.disconnectThrough(index, [value.delete.$___Owner.id, value.delete.id]);
							} else if ([then, newprop].toString() === terms.toString()) {
								this.disconnectThrough(index, [value.delete.id, value.delete.$___Owner.id]);
							} else {
								throw 'no matching terms';
							}
						}
					}
				}
			}
		}
	}
	create(collection, doucment) {
		let result = this.main.collection(collection).document.create(doucment);
		this.querySql.push(result.query);
	}
	update(collection, id, doucment) {
		let result = this.main.collection(collection).document.update(id, doucment);
		this.querySql.push(result.query);
	}
	createAndConnect(collection, doucments, relation) {}

	connect(collection, id, doucment) {
		let result = this.main.collection(collection).document.update(id, doucment);
		this.querySql.push(result.query);
	}

	disconnect(collection, id, doucment) {
		let result = this.main.collection(collection).document.update(id, doucment);
		this.querySql.push(result.query);
	}

	disconnectThrough(collection, id) {
		let result = q.Map(q.Paginate(q.Match(q.Index(collection), id)), q.Lambda('x', q.Delete(q.Get('x'))));

		this.querySql.push(result);
	}

	delete(collection, id) {
		let result = this.main.collection(collection).document.delete(id);
		this.querySql.push(result.query);
	}

	deleteThrough(collection, id) {
		let result = this.main.collection(collection).document.delete(id);
		this.querySql.push(result.query);
	}
}

module.exports = Insert;
