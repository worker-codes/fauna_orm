# Fauna ORM easily generate large amounts of fake JSON with GraphQL
[![GitHub stars](https://img.shields.io/github/stars/graphflo/fauna_orm)](https://github.com/graphflo/fauna_orm/stargazers) [![GitHub forks](https://img.shields.io/github/forks/graphflo/fauna_orm)](https://github.com/graphflo/fauna_orm/network) [![GitHub issues](https://img.shields.io/github/issues/graphflo/fauna_orm)](https://github.com/graphflo/fauna_orm/issues) [![GitHub license](https://img.shields.io/github/license/graphflo/fauna_orm)](https://github.com/graphflo/fauna_orm)
### In Development Expect Breaking Changes
## Features

- Use Fauna database without FQL.
- Create, get, list, delete, rename: databases, collections, documents, indexes, keys without FQL.
- Mongo style query.
- Easy relationship with nested insert.
- Return with relationship (Coming Soon).
- Delete with relationship (Coming Soon).
- Using Faker.js and Chance.js


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
let schema = {
	Customer: {
		indexes: {
			email: {
				indexes: {
					find: '~findByemail',
					range: null,
					rangeAll: null,
				},
			},
			age: {
				indexes: {
					find: '~findByage',
					range: '@rangeByage',
					rangeAll: '@rangeByageAll',
				},
			},
			gender: {
				indexes: {
					find: '~findBygender',
					range: null,
					rangeAll: null,
				},
			},
			eyeColor: {
				indexes: {
					find: '~findByeyeColor',
					range: null,
					rangeAll: null,
				},
			},
			isActive: {
				indexes: {
					find: '~findByisActive',
					range: null,
					rangeAll: null,
				},
			},
		},
		relations: {
			orders: {
				relationType: 'HasManyThrough',
				collection: 'Order',
				at: {
					collection: 'customerToorders',
					field: 'fromRef',
					then: 'toRef',
				},
				index: 'OrderRefByCustomerRef',
			},
			addresses: {
				relationType: 'HasManyThrough',
				collection: 'Address',
				at: {
					collection: 'addressesTocustomer',
					field: 'toRef',
					then: 'fromRef',
				},
				index: 'AddressRefByCustomerRef',
			},
		},
		views: {},
	},
	'customerToorders': {
		indexes: {
			$both: 'AllByCustomerRefAndOrderRef',
		},
		terms: ['fromRef', 'toRef'],
		relations: {
			orders: {
				relationType: 'BelongsTo',
				collection: 'Customer',
				at: {
					collection: 'customerToorders',
					field: 'fromRef',
				},
				index: 'OrderRefByCustomerRef',
			},
			customer: {
				relationType: 'BelongsTo',
				collection: 'Order',
				at: {
					collection: 'customerToorders',
					field: 'toRef',
				},
				index: 'CustomerRefByOrderRef',
			},
		},
	},
	'addressesTocustomer': {
		indexes: {
			$both: 'AllByAddressRefAndCustomerRef',
		},
		terms: ['fromRef', 'toRef'],
		relations: {
			addresses: {
				relationType: 'BelongsTo',
				collection: 'Customer',
				at: {
					collection: 'addressesTocustomer',
					field: 'toRef',
				},
				index: 'CustomerRefByAddressRef',
			},
			customer: {
				relationType: 'BelongsTo',
				collection: 'Address',
				at: {
					collection: 'addressesTocustomer',
					field: 'fromRef',
				},
				index: 'AddressRefByCustomerRef',
			},
		},
	},
	Order: {
		indexes: {
			orderNumber: {
				indexes: {
					find: '~findByorderNumber',
					range: null,
					rangeAll: null,
				},
			},
			orderDate: {
				indexes: {
					find: '~findByorderDate',
					range: '@rangeByorderDate',
					rangeAll: '@rangeByorderDateAll',
				},
			},
		},
		relations: {
			customer: {
				relationType: 'HasManyThrough',
				collection: 'Customer',
				at: {
					collection: 'customerToorders',
					field: 'toRef',
					then: 'fromRef',
				},
				index: 'CustomerRefByOrderRef',
			},
			orderitems: {
				relationType: 'HasManyThrough',
				collection: 'OrderItem',
				at: {
					collection: 'orderToorderitems',
					field: 'fromRef',
					then: 'toRef',
				},
				index: 'OrderItemRefByOrderRef',
			},
		},
		views: {},
	},
	'orderToorderitems': {
		indexes: {
			$both: 'AllByOrderRefAndOrderItemRef',
		},
		terms: ['fromRef', 'toRef'],
		relations: {
			orderitems: {
				relationType: 'BelongsTo',
				collection: 'Order',
				at: {
					collection: 'orderToorderitems',
					field: 'fromRef',
				},
				index: 'OrderItemRefByOrderRef',
			},
			order: {
				relationType: 'BelongsTo',
				collection: 'OrderItem',
				at: {
					collection: 'orderToorderitems',
					field: 'toRef',
				},
				index: 'OrderRefByOrderItemRef',
			},
		},
	},
	OrderItem: {
		indexes: {
			unitPrice: {
				indexes: {
					find: '~findByunitPrice',
					range: '@rangeByunitPrice',
					rangeAll: '@rangeByunitPriceAl',
				},
			},
			quantity: {
				indexes: {
					find: '~findByquantity',
					range: '@rangeByquantity',
					rangeAll: '@rangeByquantityAll',
				},
			},
		},
		relations: {
			order: {
				relationType: 'HasManyThrough',
				collection: 'Order',
				at: {
					collection: 'orderToorderitems',
					field: 'toRef',
					then: 'fromRef',
				},
				index: 'OrderRefByOrderItemRef',
			},
			product: {
				relationType: 'HasManyThrough',
				collection: 'Product',
				at: {
					collection: 'orderitemsToproduct',
					field: 'fromRef',
					then: 'toRef',
				},
				index: 'ProductRefByOrderItemRef',
			},
		},
		views: {},
	},
	'orderitemsToproduct': {
		indexes: {
			$both: 'AllByOrderItemRefAndProductRef',
		},
		terms: ['fromRef', 'toRef'],
		relations: {
			product: {
				relationType: 'BelongsTo',
				collection: 'OrderItem',
				at: {
					collection: 'orderitemsToproduct',
					field: 'fromRef',
				},
				index: 'ProductRefByOrderItemRef',
			},
			orderitems: {
				relationType: 'BelongsTo',
				collection: 'Product',
				at: {
					collection: 'orderitemsToproduct',
					field: 'toRef',
				},
				index: 'OrderItemRefByProductRef',
			},
		},
	},
	Supplier: {
		indexes: {},
		relations: {
			products: {
				relationType: 'HasManyThrough',
				collection: 'Product',
				at: {
					collection: 'productsTosupplier',
					field: 'toRef',
					then: 'fromRef',
				},
				index: 'ProductRefBySupplierRef',
			},
		},
		views: {},
	},
	'productsTosupplier': {
		indexes: {
			$both: 'AllByProductRefAndSupplierRef',
		},
		terms: ['fromRef', 'toRef'],
		relations: {
			products: {
				relationType: 'BelongsTo',
				collection: 'Supplier',
				at: {
					collection: 'productsTosupplier',
					field: 'toRef',
				},
				index: 'SupplierRefByProductRef',
			},
			supplier: {
				relationType: 'BelongsTo',
				collection: 'Product',
				at: {
					collection: 'productsTosupplier',
					field: 'fromRef',
				},
				index: 'ProductRefBySupplierRef',
			},
		},
	},
	Product: {
		indexes: {
			unitPrice: {
				indexes: {
					find: '~findByunitPrice',
					range: '@rangeByunitPrice',
					rangeAll: '@rangeByunitPriceAll',
				},
			},
			productName: {
				indexes: {
					find: '~findByproductName',
					range: null,
					rangeAll: null,
				},
			},
		},
		relations: {
			orderitems: {
				relationType: 'HasManyThrough',
				collection: 'OrderItem',
				at: {
					collection: 'orderitemsToproduct',
					field: 'toRef',
					then: 'fromRef',
				},
				index: 'OrderItemRefByProductRef',
			},
			supplier: {
				relationType: 'HasManyThrough',
				collection: 'Supplier',
				at: {
					collection: 'productsTosupplier',
					field: 'fromRef',
					then: 'toRef',
				},
				index: 'SupplierRefByProductRef',
			},
		},
		views: {},
	},
	Address: {
		indexes: {},
		relations: {
			customer: {
				relationType: 'HasManyThrough',
				collection: 'Customer',
				at: {
					collection: 'addressesTocustomer',
					field: 'fromRef',
					then: 'toRef',
				},
				index: 'CustomerRefByAddressRef',
			},
		},
		views: {},
	},
};

```

#### Query

```javascript
//Simple equal satement single parameter, return ref
let filter = {
	email : "grayburt@exosis.com",
	gender  { $eq: "female"},
	isActive : { $ne: true},
	date : { $range:[3245235234, 34532452345] }
	country : { $nin:['Mexico',"Canada","England"]},
	$and:[
		{
			age :  { $lte:10 }
		},
		{
			age :  { $gte:50 }
		},
	],
	or:[
		{
			eyeColor : "green",
		},
		{
			eyeColor : "brown",
		},
	],
	not:[
		{
			state : "New York",
		},
		{
			state : "California",
		},
	]
}
//Return refs
let query = orm.collection('COLLECTION_NAME')
	.where(filter)
	.get();

//Return full documents
let query = orm.collection('COLLECTION_NAME')
	.where(filter)
	.getDoc()
	.get();

//Limit to 20.
//Return full documents.
let query = orm.collection('COLLECTION_NAME')
	.where(filter)
	.limit(20)
	.getDoc()
	.get();

//Limit to 20.
//Paginate
//Return full documents.
let query = orm.collection('COLLECTION_NAME')
	.where(filter)
	.limit(20)
	.after("AFTER_DOCUMET_ID")
	.before("BEFORE_DOCUMET_ID")
	.getDoc()
	.get();

//Simple equal satement single parameter, return full documents
let query = orm.collection('COLLECTION_NAME')
.where(filter)
.get();
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
				create: [
					{
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

//list all database
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
	.annotate({key:"value"})
	.run();
```

#### Key

```javascript
//create key
let query = orm.key()
	.create("DATABASE_NAME", "ROLE_NAME", "KEY_NAME", "KEY_DATA")
	.run();

//list all key
let query = orm.key()
	.all()
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

//list all collection
let query = orm.collection()
	.all()
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
	.document.create({ foo:"bar" })
	.run();

//create document with id
let query = orm.collection("COLLECTION_NAME")
	.document.create({id:"DOCUMENT_ID", foo:"bar" })
	.run();

//create many document
let query = orm.collection("COLLECTION_NAME")
	.document
	.createMany([{ foo:"bar" },{ baz:"faz" }])
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
	.update('DOCUMENT_ID', { foo:"bar" })
	.run();

//replace single document
let query = orm.collection("COLLECTION_NAME")
	.document
	.replace('DOCUMENT_ID', { foo:"bar" })
	.run();

//delete document
let query = orm.collection("COLLECTION_NAME")
	.document.
	delete()
	.run();
```

#### Index

```javascript
//create index
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
	.create("COLLECTION_NAME",  null, ["email", "name", "address.city"])
	.run();

//create index with values, ref, ts
let query = orm.index('INDEX_NAME')
	.create("COLLECTION_NAME",  null, ["email", "ref", "ts"])
	.run();

//create unique index
let query = orm.index('INDEX_NAME')
	.create('collection', "email", null , true)
	.run();

//list all collection
let query = orm.index().all()).run();

//get single collection
let query = orm.index("INDEX_NAME")
	.get()
	.run();

//rename single collection
let query = orm.index("INDEX_NAME")
	.renameTo('INDEX_NAME')
	.run();

//delete collection
let query = orm.index("INDEX_NAME")
	.delete()
	.run();
```

### Acknowledgements & Thanks
- faunadb