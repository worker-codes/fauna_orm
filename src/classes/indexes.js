const faunadb = require('faunadb');
const q = faunadb.query;

function genTermObj(terms) {
    // terms is an array of names
    if (typeof terms == 'string') return [{ field: ['data', terms] }];
    // we have an array
    const termsObj = [];
    for (let i = 0; i < terms.length; i++) {
        if (terms[i] === 'ts') {
            termsObj.push({ field: ['ts'] })
        } else if (terms[i] === 'ref') {
            termsObj.push({ field: ['ref'] })
        } else {
            termsObj.push({ field: ['data', `${terms[i]}`] });
        }
    }
    return termsObj;
}
function genValueObj(values) {
    // terms is an array of names
    const valueObj = [];
    
    for (let i = 0; i < values.length; i++) {
        if (values[i] === 'ts') {
            valueObj.push({ field: ['ts'] })
        } else if (values[i] === 'ref') {
            valueObj.push({ field: ['ref'] })
        } else {
            valueObj.push({ field: ['data', `${values[i]}`] });
        }
    }

    return valueObj;
}

module.exports =(main, name)=> {
    return {
        create(collection, terms, values, unique = false) {
            const config = {
                name,
                source: q.Class(collection),
                unique,
            };
    
            if (terms) config.terms = genTermObj(terms);
            if (values) config.values = genValueObj(values);
    
            main.query = q.CreateIndex(config);
            return main;
        },
    
        all() {           
            main.query = q.Paginate(q.Indexes());
            return main;
        },
    
        get() {
            main.query = q.Get(q.Index(name));
            return main;
        },
    
        renameTo(newName) {
            main.query = q.Update(q.Index(name), { name: newName });
            return main;
        },
    
        delete() {
            main.query = q.Delete(q.Index(name));
            return main;
        }
    }
}
