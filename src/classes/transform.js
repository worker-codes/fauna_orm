const faunadb = require('faunadb');
const q = faunadb.query;

function getAllCollections() {
	return q.Map(q.Paginate(q.Collections()), q.Lambda('item', q.Select('id', q.Var('item'))));
}

function getAllIndexes() {
	return q.Map(q.Paginate(q.Indexes()), q.Lambda('item', q.Select('id', q.Var('item'))));
}

function createCollections(collections) {
	return q.Map(
		collections,
		q.Lambda(
			'item',
			q.CreateCollection({
				name: q.Var('item'),
			})
		)
	);
}

function bothIndex(name, collection) {
	const config = {
		name:  name,
		source: q.Collection(collection),
		terms: [{ field: ['data', 'fromRef'] }, { field: ['data', 'toRef'] }],
	};

	return q.CreateIndex(config);
}

function toIndex(name, collection) {
	const config = {
		name:  name,
		source: q.Collection(collection),
		terms: [{ field: ['data', 'fromRef'] }],
		values: [{ field: ['data', 'toRef'] }],
	};

	return q.CreateIndex(config);
}

function fromIndex(name, collection) {
	const config = {
		name: name,
		source: q.Collection(collection),
		terms: [{ field: ['data', 'toRef'] }],
		values: [{ field: ['data', 'fromRef'] }],
	};

	return q.CreateIndex(config);
}

function findBy(field, index, collection, unique = false) {
	const config = {
		name: index,
		source: q.Collection(collection),
        terms: [{ field: ['data', field] }],
        unique:unique
	};

	return q.CreateIndex(config);
}
function rangeBy(field, index, collection) {
	const config = {
		name: index,
		source: q.Collection(collection),
		values: [{ field: ['data', field] }, { field: ['ref'] }],
	};

	return q.CreateIndex(config);
}

function rangeByAll(field, index, collection) {
	const config = {
		name: index,
		source: q.Collection(collection),
		terms: [{ field: ['data', field] }, { field: ['ref'] }],
	};

	return q.CreateIndex(config);
}


function findDuplicateInArray(arra1) {
    const object = {};
    const result = [];

    arra1.forEach(item => {
      if(!object[item])
          object[item] = 0;
        object[item] += 1;
    })

    for (const prop in object) {
       if(object[prop] >= 2) {
           result.push(prop);
       }
    }

    return result;

}

module.exports = async function transform(main) {
	let collections = [];
	let findIndexes = [];
	let rangeIndexes = [];
	let rangeAllIndexes = [];
	let fromIndexes = [];
	let toIndexes = [];
    let bothIndexes = [];

    let indexes =[]
    
    let currentDatabase = await  main.client.query(
        q.Let(
            {
                collections: getAllCollections(),
                indexes: getAllIndexes()
            },
            {
                collections: q.Select(["data"], q.Var('collections')),
                indexes: q.Select(["data"], q.Var('indexes'))
            }
        )
    )

	for (const key in main.schema) {
		if (main.schema.hasOwnProperty(key)) {
            const collection = main.schema[key];
            
            if (!currentDatabase.collections.includes(key)) {
                collections.push(key)
            }            

			for (const key2 in collection.fields) {
				if (collection.fields.hasOwnProperty(key2)) {
					const field = collection.fields[key2];

					if (field.indexes.find && !currentDatabase.indexes.includes(field.indexes.find)) {
                        findIndexes.push(field.indexes.find);
                        
                        indexes.push(findBy(key2, field.indexes.find, key, field.unique))
                    }

                    if (field.indexes.range && !currentDatabase.indexes.includes(field.indexes.range)) {
                        rangeIndexes.push(field.indexes.range);
                        indexes.push(rangeBy(key2, field.indexes.range, key))
                    }

                    if (field.indexes.rangeAll && !currentDatabase.indexes.includes(field.indexes.rangeAll)) {
                        rangeAllIndexes.push(field.indexes.rangeAll);
                        
                        indexes.push(rangeByAll(key2, field.indexes.rangeAll, key))
                    }	
                    
                    if (field.indexes.relation && !currentDatabase.indexes.includes(field.indexes.relation)) {
                        
                        if (key2 === "fromRef") {
                            fromIndexes.push(field.indexes.relation);
                            indexes.push(fromIndex(field.indexes.relation, key))
                        } else if (key2 === "toRef") {
                            toIndexes.push(field.indexes.relation);
                            indexes.push(toIndex(field.indexes.relation, key))
                        }
                        
                    }	

                   
                }
            }                       

		}
    }

    let allIndexes = findIndexes.concat( rangeIndexes, rangeAllIndexes, fromIndexes, toIndexes, bothIndexes);

    
    let duplicateIndexes = findDuplicateInArray(allIndexes)

    if (duplicateIndexes.length > 0) {
        throw "Please remove or change duplicate index name " + duplicateIndexes
    }

    try {
        if (collections.length > 0) {
            let createdCollections = await  main.client.query(createCollections(collections))
        console.log("Collection created " + collections);
        } else {
            console.log("No collection created");
        }
        
    } catch (error) {

        console.log(error);   
        throw "Fail to create collections";            
    }
    

    try {
        if (indexes.length > 0) {
            let createdIndexes = await  main.client.query(q.Do(...indexes))
            console.log("Indexes created " + allIndexes);
        }else{
            console.log("No indexes created");
        }
       
    } catch (error) {

        console.log(error); 
        throw "Fail to create indexes";           
    }
    
}


