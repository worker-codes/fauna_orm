const { simpleflake } = require('simpleflakes');

function snowId() {
    const flakeBigInt = simpleflake()
    return flakeBigInt.toString();

}

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


module.exports = {
    genTermObj,
    genValueObj,
    snowId
}