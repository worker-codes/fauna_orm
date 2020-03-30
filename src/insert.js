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

		// console.log(this.querySql);
		console.dir(this.querySql, { depth: null });

		// throw "Dsgdfdsfgsdfgsdfg"

		return q.Do(this.querySql);
	}
	relationBuilder(doc, ModelName, owner = null, isUpdate = false) {
		let relation;
		let parent;
		let model = this.main.schema[ModelName];

		let relationsKey = Object.keys(model.relations);
		let id;

		if (isUpdate) {
			relation = _.pick(doc, relationsKey);

			id = doc.id;

			parent = {
				collection: ModelName,
				id: '' + id,
			};

			doc['$___Model'] = ModelName;

			if (owner) {
				doc['$___Owner'] = owner;
			}
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
		}

		for (const [key, value] of Object.entries(relation)) {
			let relation = model.relations[key];
			if (relation) {
				if (value.create) {
					if (Array.isArray(value.create)) {
						value.create.map(n => {
							this.relationBuilder(n, relation.collection, parent);
						});
					} else if (typeof value.create === 'object') {
						this.relationBuilder(value.create, relation.collection, parent);
					}
				}

				if (value.update) {
					if (Array.isArray(value.update)) {
						value.update.map(n => {
							this.relationBuilder(n, relation.collection, parent, true);
						});
					} else if (typeof value.update === 'object') {
						this.relationBuilder(value.update, relation.collection, parent, true);
					}
				}
				if (value.connect) {
					if (Array.isArray(value.connect)) {
						value.connect.map(n => {
							this.relationBuilder(n, relation.collection, parent);
						});
					} else if (typeof value.connect === 'object') {
						this.relationBuilder(value.connect, relation.collection, parent);
					}
                }
                
                if (value.set) {
					if (Array.isArray(value.set)) {
						value.set.map(n => {
							this.relationBuilder(n, relation.collection, parent);
						});
					} else if (typeof value.set === 'object') {
						this.relationBuilder(value.set, relation.collection, parent);
					}
				}

				if (value.disconnect) {
					if (Array.isArray(value.disconnect)) {
						value.disconnect.map(n => {
							this.relationBuilder(n, relation.collection, parent);
						});
					} else if (typeof value.disconnect === 'object') {
						this.relationBuilder(value.disconnect, relation.collection, parent);
					}
				}

				if (value.delete) {
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

		return id;
	}

	buildQuery(doc, relationModel = null, update = false, relationName = null) {
		let model = this.main.schema[doc.$___Model];

		let relationsKey = Object.keys(model.relations);
		let documentsToInsert;
		let relations;

		// if (update) {
		// 	documentsToInsert = _.omit(doc, [...relationsKey, '$___Model', '$___Owner']);
		// 	relations = _.pick(doc, relationsKey);
		// } else {
		// 	documentsToInsert = _.omit(doc, [...relationsKey, '$___Model', '$___Owner']);
		// 	relations = _.pick(doc, relationsKey);
		// }

		documentsToInsert = _.omit(doc, [...relationsKey, '$___Model', '$___Owner']);
		relations = _.pick(doc, relationsKey);

		if (doc.$___Owner) {
			if (update) {
				this.update(doc.$___Model, doc.id, documentsToInsert);
			} else {
				this.createConnect(relationModel, doc, relationName);
				this.create(doc.$___Model, documentsToInsert);
			}
		} else {
			if (update) {
                if (condition) {
                    
                }
				this.update(doc.$___Model, doc.id, documentsToInsert);
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
							this.buildQuery(n, _relation, false, key);
						});
					} else if (typeof value.create === 'object') {
						this.buildQuery(value.create, _relation, false, key);
					}
				}
				if (value.update) {
					if (Array.isArray(value.update)) {
						value.update.map(n => {
							this.buildQuery(n, _relation, true, key);
						});
					} else if (typeof value.update === 'object') {
						this.buildQuery(value.update, _relation, true, key);
					}
				}
				if (value.connect) {
					if (Array.isArray(value.connect)) {
						value.connect.map(n => {
							this.createConnect(_relation, n, key);
						});
					} else if (typeof value.connect === 'object') {                                               
						this.createConnect(_relation, value.connect, key);
					}
                }
                
                if (value.set) {
					if (Array.isArray(value.set)) {
						value.set.map(n => {
							this.set(_relation, n, key);
						});
					} else if (typeof value.set === 'object') {
						this.set(_relation, value.set, key);
					}
				}

				if (value.disconnect) {
					4;
					if (Array.isArray(value.disconnect)) {
						value.disconnect.map(n => {
							this.disconnectThrough(_relation, n, key);
						});
					} else if (typeof value.disconnect === 'object') {
						this.disconnectThrough(_relation, value.disconnect, key);
					}
				}

				if (value.delete) {
					if (Array.isArray(value.delete)) {
						value.delete.map(n => {
							this.disconnectThrough(_relation, n, key);
							this.delete(n.$___Model, n.delete.id);
						});
					} else if (typeof value.delete === 'object') {
						this.disconnectThrough(_relation, value.delete, key);
						this.delete(value.delete.$___Model, value.delete.id);
					}
				}
			}
		}
	}
	create(collection, docment) {
		let result = this.main.collection(collection).document.create(docment);
		this.querySql.push(result.query);
	}
	update(collection, id, docment) {
		let result = this.main.collection(collection).document.update(id, docment);
		this.querySql.push(result.query);
	}
	createConnect(relationObject, docment, relationName) {
        
        let edge = this.main.schema[relationObject.at];
        let from = edge.fields.fromRef.collection;
        let to = edge.fields.toRef.collection;

        if (from === docment.$___Owner.collection && to === relationObject.collection ) {
            this.create(relationObject.at, {
				fromRef: q.Ref(q.Collection(docment.$___Owner.collection), '' + docment.$___Owner.id),
				toRef: q.Ref(q.Collection(relationObject.collection), '' + docment.id),
			}); 
        } else if (to === docment.$___Owner.collection && from === relationObject.collection ) {
            this.create(relationObject.at, {
                fromRef: q.Ref(q.Collection(relationObject.collection), '' + docment.id),
				toRef: q.Ref(q.Collection(docment.$___Owner.collection), '' + docment.$___Owner.id)				
			}); 
        } else {
			throw `The field \`collection\` is missing from \`fields.fromRef\` or \`fields.toRef\` on the \`${relationObject.at}\` Model `;
		}
    }
    
    set(relationObject, docment, relationName) {

        let result = null;
        let edge = this.main.schema[relationObject.at];
        let from = edge.fields.fromRef;
        let to = edge.fields.toRef;

		if (from.collection === docment.$___Owner.collection && to.collection === docment.$___Model) {

            let parentRef = q.Ref(q.Collection(docment.$___Owner.collection), docment.$___Owner.id);
            let ref = q.Ref(q.Collection(docment.$___Model), docment.id);
            
            let create = q.Create(
                q.Collection(relationObject.at),
                { data: { 
                    fromRef: parentRef,
                    toRef: ref,
                } },
            )
            let update = q.Update(
                q.Select(["data",0], q.Var("items")),
                { data: { toRef: ref } },
            )
            result = q.Do(
                q.Let({
                    items:q.Paginate(
                        q.Match(q.Index(from.indexes.find), parentRef),                
                    )
                  },
                  q.If(q.IsEmpty(q.Var("items")),
                    create,
                    update
                  )
                )  
            )
			// result = q.Map(
            //     q.Paginate(
            //         q.Match(q.Index(from.indexes.find), parentRef),                
            //     ),
            //     q.Lambda('x',
            //         q.Update(
            //             q.Var('x'),
            //             { data: { toRef: ref } },
            //         )
            //     )
            // )
		} else if (to === docment.$___Owner.collection && from === docment.$___Model) {

			let parentRef = q.Ref(q.Collection(docment.$___Model), docment.id); 
            let ref = q.Ref(q.Collection(docment.$___Owner.collection), docment.$___Owner.id);

            let create = q.Create(
                q.Collection(relationObject.at),
                { data: { 
                    toRef: parentRef,
                    fromRef: ref,
                } },
            )
            let update = q.Update(
                q.Select(["data",0], q.Var("items")),
                { data: { fromRef: ref } },
            )
            result = q.Do(
                Let({
                    items:q.Paginate(
                        q.Match(q.Index(to.indexes.find), parentRef),                
                    )
                  },
                  q.If(q.IsEmpty(q.Var("items")),
                    create,
                    update
                  )
                )  
            )           

		} else {
			throw `The field \`collection\` is missing from \`fields.fromRef\` or \`fields.toRef\` on the \`${relationObject.at}\` Model `;
        }

		this.querySql.push(result);

	}

	connect(collection, id, docment) {
		let result = this.main.collection(collection).document.update(id, docment);
		this.querySql.push(result.query);
	}

	disconnect(collection, id, docment) {
		let result = this.main.collection(collection).document.update(id, docment);
		this.querySql.push(result.query);
	}

	disconnectThrough(relationObject, docment, relationName) {

        let result = null;
        let edge = this.main.schema[relationObject.at];
        let from = edge.fields.fromRef;
        let to = edge.fields.toRef;

        if (from.collection === docment.$___Owner.collection && to.collection === docment.$___Model ) {
            let both = q.Intersection (
                q.Match(q.Index(from.indexes.find),  q.Ref(q.Collection(docment.$___Owner.collection), docment.$___Owner.id)),
                q.Match(q.Index(to.indexes.find),  q.Ref(q.Collection(docment.$___Model), docment.id))
            )
            result = q.Map(q.Paginate(both), q.Lambda('x', q.Delete(q.Var('x'))));

        } else if (to.collection === docment.$___Owner.collection && from.collection === docment.$___Model ) {

            let both = q.Intersection (
                q.Match(q.Index(to.indexes.find),  q.Ref(q.Collection(docment.$___Owner.collection), docment.$___Owner.id)),
			    q.Match(q.Index(from.indexes.find),  q.Ref(q.Collection(docment.$___Model), docment.id))
            );
            result = q.Map(q.Paginate(both), q.Lambda('x', q.Delete(q.Var('x'))));
        } else {
			throw `The field \`collection\` is missing from \`fields.fromRef\` or \`fields.toRef\` on the \`${relationObject.at}\` Model `;
        }

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


// CreateIndex({
//     name: 'EdgeRefByRef',
//     source: {
//       collection: Collection('OrderItemToProduct'),
//       fields: {
//         hasContactId: Query(
//           Lambda(
//             'doc',
//             [q.Select(['data', 'fromRef'], q.Var('doc')),q.Select(['data', 'toRef'], q.Var('doc'))]                
//           )
//         )
//       }
//     },
//     terms: [{ binding: 'hasContactId' }],
//   })