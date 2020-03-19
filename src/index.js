const faunadb = require('faunadb');
const { database, collection, document, key, indexes } = require('./classes');

class faunaORM {
    constructor(schema, secret) {
        this.schema = schema;
        this.query = null;
        this.secret = secret;
        this.client = new faunadb.Client({ secret: secret });
    }
    database(name) {       
        return database(this, name);
    }

    key(name) {
        return key(this, name);
    }

    collection(name) {
        return collection(this, name);
    }

    index(name) {
        return indexes(this, name);
    }

   async run() {
        return await this.client.query(this.query);
    }
}

module.exports = faunaORM;
