# An ORM for Fauna Database
[![GitHub stars](https://img.shields.io/github/stars/graphflo/fauna_orm)](https://github.com/graphflo/fauna_orm/stargazers) [![GitHub forks](https://img.shields.io/github/forks/graphflo/fauna_orm)](https://github.com/graphflo/fauna_orm/network) [![GitHub issues](https://img.shields.io/github/issues/graphflo/fauna_orm)](https://github.com/graphflo/fauna_orm/issues) [![GitHub license](https://img.shields.io/github/license/graphflo/fauna_orm)](https://github.com/graphflo/fauna_orm)
### In Development Expect Breaking Changes
## Features

- Use Fauna database without FQL.
- Helper function: create, get, list, delete, rename: databases, collections, documents, indexes, keys without FQL.
- Auto migrate database with the appropriate collection and indexes.
- Mongo style query.
- Easy relationship with nested insert.
- Return with relationship (Coming Soon).
- Delete with relationship (Coming Soon).


#### Install Fauna ORM

```
npm install fauna_orm
yarn add fauna_orm
```

#### How to use Fauna ORM

```javascript
const faunaORM = require('fauna_orm ');
let orm = new faunaORM(schema, 'secret');

```

#### Schema

```javascript
let NewSchema = {
  Customer: {
    fields: {
      email: {
        indexes: {
          find: 'findByemail',
        },
      },
      age: {
        indexes: {
          find: 'findByage',
          range: 'rangeByage',
          rangeAll: 'rangeByageAll',
        },
      },
      gender: {
        indexes: {
          find: 'findBygender',
        },
      },
      eyeColor: {
        indexes: {
          find: 'findByeyeColor',
        },
      },
      isActive: {
        indexes: {
          find: 'findByisActive',
        },
      },
    },
    relations: {
      addresses: {
        collection: 'Address',
        at: 'AddressToCustomer',
        index: 'AddressRefByCustomerRef',
      },

      orders: {
        collection: 'Order',
        at: 'CustomerToOrder',
        index: 'OrderRefByCustomerRef',
      },
    },
    views: {},
  },

  AddressToCustomer: {
    fields: {
      fromRef: {
        collection: 'Address',
        indexes: {
          find: 'AddressToCustomerRefByAddressRef',
          relation: 'AddressRefByCustomerRef',
        },
      },
      toRef: {
        collection: 'Customer',
        indexes: {
          find: 'AddressToCustomerRefByCustomerRef',
          relation: 'CustomerRefByAddressRef',
        },
      },
    },
  },

  Address: {
    fields: {
      state: {
        indexes: {
          find: 'findByState',
        },
      },
      country: {
        indexes: {
          find: 'findByCountry',
        },
      },
    },
    relations: {
      customer: {
        collection: 'Customer',
        at: 'AddressToCustomer',
        index: 'CustomerRefByAddressRef',
      },
    },
    views: {},
  },

  CustomerToOrder: {
    fields: {
      fromRef: {
        collection: 'Customer',
        indexes: {
          find: 'CustomerToOrderRefByCustomerRef',
          relation: 'CustomerRefByOrderRef',
        },
      },
      toRef: {
        collection: 'Order',
        indexes: {
          find: 'CustomerToOrderRefByOrderRef',
          relation: 'OrderRefByCustomerRef',
        },
      },
    },
  },

  Order: {
    fields: {
      orderNumber: {
        indexes: {
          find: 'findByorderNumber',
          range: null,
          rangeAll: null,
        },
      },
      orderDate: {
        indexes: {
          find: 'findByorderDate',
          range: 'rangeByorderDate',
          rangeAll: 'rangeByorderDateAll',
        },
      },
    },
    relations: {
      customer: {
        collection: 'Customer',
        at: 'CustomerToOrder',
        index: 'CustomerRefByOrderRef',
      },
      orderitems: {
        collection: 'OrderItem',
        at: 'OrderToOrderItem',
        index: 'OrderItemRefByOrderRef',
      },
    },
    views: {},
  },


  OrderToOrderItem: {
    fields: {
      fromRef: {
        collection: 'Order',
        indexes: {
          find: 'OrderToOrderItemRefByOrderRef',
          relation: 'OrderRefByOrderItemRef',
        },
      },
      toRef: {
        collection: 'OrderItem',
        indexes: {
          find: 'OrderToOrderItemRefByOrderItemRef',
          relation: 'OrderItemRefByOrderRef',
        },
      },
    },
  },

  OrderItem: {
    fields: {
      unitPrice: {
        indexes: {
          find: 'findByunitPrice',
          range: 'rangeByunitPrice',
          rangeAll: 'rangeByunitPriceAll',
        },
      },
      quantity: {
        indexes: {
          find: 'findByquantity',
          range: 'rangeByquantity',
          rangeAll: 'rangeByquantityAll',
        },
      },
    },
    relations: {
      order: {
        collection: 'Order',
        at: 'OrderToOrderItem',
        index: 'OrderRefByOrderItemRef',
      },
      product: {
        collection: 'Product',
        at: 'OrderItemToProduct',
        index: 'ProductRefByOrderItemRef',
      },

    },
    views: {},
  },
  OrderItemToProduct: {
    fields: {
      fromRef: {
        collection: 'OrderItem',
        indexes: {
          find: 'OrderItemToProductRefByOrderItemRef',
          relation: 'OrderItemRefByProductRef',
        },
      },
      toRef: {
        collection: 'Product',
        indexes: {
          find: 'OrderItemToProductRefByProductRef',
          relation: 'ProductRefByOrderItemRef',
        },
      },
    },
  },
  Product: {
    fields: {
      unitPrice: {
        indexes: {
          find: 'findByProductunitPrice',
          range: 'rangeByProductunitPrice',
          rangeAll: 'rangeByProductunitPriceAll',
        },
      },
      productName: {
        indexes: {
          find: 'findByproductName',
          range: null,
          rangeAll: null,
        },
      },
    },
    relations: {
      orderitems: {
        collection: 'OrderItem',
        at: 'OrderItemToProduct',
        index: 'OrderItemRefByProductRef',
      },
      supplier: {
        collection: 'Supplier',
        at: 'ProductToSupplier',
        index: 'SupplierRefByProductRef',
      },
    },
    views: {},
  },
  ProductToSupplier: {
    fields: {
      fromRef: {
        collection: 'Supplier',
        indexes: {
          find: 'ProductToSupplierRefBySupplierRef',
          relation: 'SupplierRefByProductRef',
        },
      },
      toRef: {
        collection: 'Product',
        indexes: {
          find: 'ProductToSupplierRefByProductRef',
          relation: 'ProductRefBySupplierRef',
        },
      },
    },
  },
  Supplier: {
    fields: {},
    relations: {
      products: {
        collection: 'Product',
        at: 'ProductToSupplier',
        index: 'ProductRefBySupplierRef',
      },
    },
    views: {},
  },
}

```

#### Transform

```javascript
let query = orm.transform();

```

#### Query

```javascript
//Simple equal satement single parameter, return ref
let filter = {
  email: "grayburt@exosis.com",
  gender {
    $eq: "female"
  },
  isActive: {
    $ne: true
  },
  date: {
    $range: [3245235234, 34532452345]
  }
  country: {
    $nin: ['Mexico', "Canada", "England"]
  },
  $and: [{
      age: {
        $lte: 10
      }
    },
    {
      age: {
        $gte: 50
      }
    },
  ],
  or: [{
      eyeColor: "green",
    },
    {
      eyeColor: "brown",
    },
  ],
  not: [{
      state: "New York",
    },
    {
      state: "California",
    },
  ]
}
//Return refs
let query = orm.collection('COLLECTION_NAME')
  .where(filter)
  .run();

//Return full documents
let query = orm.collection('COLLECTION_NAME')
  .where(filter)
  .getDoc()
  .run();

//Limit to 20.
//Return full documents.
let query = orm.collection('COLLECTION_NAME')
  .where(filter)
  .limit(20)
  .getDoc()
  .run();

//Limit to 20.
//Paginate
//Return full documents.
let query = orm.collection('COLLECTION_NAME')
  .where(filter)
  .limit(20)
  .after("AFTER_DOCUMET_ID")
  .before("BEFORE_DOCUMET_ID")
  .getDoc()
  .run();

//Simple equal satement single parameter, return full documents
let query = orm.collection('COLLECTION_NAME')
  .where(filter)
  .run();
```

#### Nested Insert

```javascript
let insertDocument = {
  firstname: 'Santino',
  lastname: 'Ortiz',
  email: 'Gunnerfffffghhgg22.Gleichner@gmail.com',
  age: 14,
  gender: 'female',
  isActive: true,
  phone: '18802876350',
  address: {
    create: {
      street: '6245 Rohan Extension',
      street2: 'Suite 101',
      state: 'Pakistan',
      city: 'Western Sahara',
      country: 'Madagascar',
    },
  },
  orders: {
    create: {
      orderdate: '1972-11-04T15:45:00.266Z',
      ordernumber: '5e71407b0fdab829807727f0',
      totalamount: 3424.67,
      orderitems: {
        create: [{
            unitprice: 21.69,
            quantity: 65,
            product: {
              connect: {
                id: '5350192081779138715',
              },
            },
          },
          {
            unitprice: 231.69,
            quantity: 4,
            product: {
              connect: {
                id: '32524523452345325345',
              },
            },
          },
          {
            unitprice: 651.69,
            quantity: 34,
            product: {
              connect: {
                id: '3453245324532453245345',
              },
            },
          },
        ],
      },
    },
  },
};

let insert = orm2
  .collection('COLLECTION_NAME')
  .insert(insertDocument)
  .run()
```


#### Database

```javascript
//create database
let query = orm.database('DATABASE_NAME')
  .create()
  .run();

//list all databases Refs
let query = orm.database()
	.allRef()
	.run();

//list all database document
let query = orm.database()
  .all()
  .run();

//get single database
let query = orm.database("DATABASE_NAME")
  .get()
  .run();

//rename single database
let query = orm.database("OLD_DATABASE_NAME")
  .renameTo('NEW_DATABASE_NAME')
  .run();

//delete database
let query = orm.database("DATABASE_NAME")
  .delete()
  .run();

//annotate database
let query = orm.database("DATABASE_NAME")
  .annotate({
    key: "value"
  })
  .run();
```

#### Key

```javascript
//create key
let query = orm.key()
  .create("DATABASE_NAME", "ROLE_NAME", "KEY_NAME", "KEY_DATA")
  .run();

//list all key Refs
let query = orm.key()
	.allRef()
	.run();

//list all key documents
let query = orm.key()
  .all()
  .run();

//get key from secret
let query = orm.key()
	.keyFromSecret("SECRET")
	.run();

//get single key
let query = orm.key("KEY_ID")
  .get()
  .run();

//delete key
let query = orm.key("KEY_ID")
  .delete()
  .run();
```

#### Collection

```javascript
//create collection
let query = orm.collection('COLLECTION_NAME')
  .create()
  .run();

//update collection
let query = orm.collection('COLLECTION_NAME')
	.update({
		name: name,
		ttl_days: ttl_days,
		history_days: history_days,
		data: data,
		permissions: permissions
	})
	.run();

//list all collection Refs
let query = orm.collection()
  .all()
  .run();

//list all collection Documents
let query = orm.collection()
	.allRef()
	.run();

//get single collection
let query = orm.collection("COLLECTION_NAME")
  .get()
  .run();

//rename single collection
let query = orm.collection("OLD_COLLECTION_NAME")
  .renameTo('NEW_COLLECTION_NAME')
  .run();

//delete collection
let query = orm.collection("COLLECTION_NAME")
  .delete()
  .run();
```

#### Document

```javascript
//create document
let query = orm.collection("COLLECTION_NAME")
  .document.create({
    foo: "bar"
  })
  .run();

//create document with id
let query = orm.collection("COLLECTION_NAME")
  .document.create({
    id: "DOCUMENT_ID",
    foo: "bar"
  })
  .run();

//create many document
let query = orm.collection("COLLECTION_NAME")
  .document
  .createMany([{
    foo: "bar"
  }, {
    baz: "faz"
  }])
  .run();

//list all document
let query = orm.collection("COLLECTION_NAME")
  .document
  .all()
  .run();

//get single document
let query = orm.collection("COLLECTION_NAME")
  .document
  .get("DOCUMENT_ID")
  .run();

//update single collection
let query = orm.collection("COLLECTION_NAME")
  .document
  .update('DOCUMENT_ID', {
    foo: "bar"
  })
  .run();

//replace single document
let query = orm.collection("COLLECTION_NAME")
  .document
  .replace('DOCUMENT_ID', {
    foo: "bar"
  })
  .run();

//delete document
let query = orm.collection("COLLECTION_NAME")
  .document.
delete()
  .run();
```

#### Index

```javascript
// create index
let query = orm.index('INDEX_NAME')
  .create("COLLECTION_NAME")
  .run();

//create index with terms
let query = orm.index('INDEX_NAME')
  .create("COLLECTION_NAME", ["email", "name", "address.city"])
  .run();

//create index with terms, ref and ts
let query = orm.index('INDEX_NAME')
  .create("COLLECTION_NAME", ["email", "ref", "ts"])
  .run();

//create index with values
let query = orm.index('INDEX_NAME')
  .create("COLLECTION_NAME", null, ["email", "name", "address.city"])
  .run();

//create index with values, ref, ts
let query = orm.index('INDEX_NAME')
  .create("COLLECTION_NAME", null, ["email", "ref", "ts"])
  .run();

//create unique index
let query = orm.index('INDEX_NAME')
  .create('collection', "email", null, true)
  .run();

//list all collection
let query = orm.index().all().run();

//get single collection
let query = orm.index("INDEX_NAME")
  .get()
  .run();

// rename single index
let query = orm.index("INDEX_NAME")
  .renameTo('INDEX_NAME')
  .run();

// delete index
let query = orm.index("INDEX_NAME")
  .delete()
  .run();
```

### Acknowledgements & Thanks
- faunadb