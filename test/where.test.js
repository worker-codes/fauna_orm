const faunadb = require('faunadb');
const q = faunadb.query;

const ORM = require('../src');
let where = new ORM()

test('Simple Equal Satement One Parameter { key:value }', () => {

    let fauna_query = q.Paginate(
        q.Join(    
            q.Intersection(
                q.Match(q.Index("product_search_by_unitprice_"), 48.53),
            ),
            q.Index('product_sort_by_unitprice_asc_')
        )
    )

    let filter = {
        product_search_by_unitprice_ : 48.53,
    }

   let query = orm
    .collection('Product')
    .where(filter)
    .viewBy('product_sort_by_unitprice_asc_')
    .limit(10)
    .before(200)
    .get();

  expect(fauna_query).toEqual(query)
});


test('Simple Equal Satement With Two Parameters { key:value }', () => {

    let fauna_query = q.Paginate(
        q.Join(    
            q.Intersection(
                q.Match(q.Index("product_search_by_unitprice_"), 48.53),
            ),
            q.Index('product_sort_by_unitprice_asc_')
        )
    )

    let filter = {
        product_search_by_unitprice_ : 48.53,
    }

   let query = orm
    .collection('Product')
    .where(filter)
    .viewBy('product_sort_by_unitprice_asc_')
    .limit(10)
    .before(200)
    .get();

  expect(fauna_query).toEqual(query)
});


test('Simple Equal Satement With Two Parameters { key:value, key2:value2}', () => {

    let fauna_query = q.Paginate(
        q.Join(    
            q.Intersection(
                q.Match(q.Index("product_search_by_unitprice_"), 48.53),
                q.Match(q.Index("product_search_by_productname_"), "Fantastic Metal Ball")  
            ),
            q.Index('product_sort_by_unitprice_asc_')
        )
    )

    let filter = {
        product_search_by_unitprice_ : 48.53,
        product_search_by_productname_:"Fantastic Metal Ball"
    }

   let query = orm
    .collection('Product')
    .where(filter)
    .viewBy('product_sort_by_unitprice_asc_')
    .limit(10)
    .before(200)
    .get();

  expect(fauna_query).toEqual(query)
});



test('$and Satement $and:[{ key:value },{ key2:value2 }]', () => {

    let fauna_query = q.Paginate(
        q.Join(    
            q.Intersection(
                q.Intersection(
                    q.Match(q.Index("product_search_by_unitprice_"), 48.53),
                    q.Match(q.Index("product_search_by_productname_"), "Fantastic Metal Ball")  
                ) 
            ),
            q.Index('product_sort_by_unitprice_asc_')
        )
    )

    let filter = {
        $and:[
            { product_search_by_unitprice_ : 48.53 },
            { product_search_by_productname_:"Fantastic Metal Ball" },
        ]
    }

   let query = orm
    .collection('Product')
    .where(filter)
    .viewBy('product_sort_by_unitprice_asc_')
    .limit(10)
    .before(200)
    .get();

  expect(fauna_query).toEqual(query)
});



test('$or Satement $or:[{ key:value },{ key2:value2 }]', () => {

    let fauna_query = q.Paginate(
        q.Join(    
            q.Intersection(
                q.Union(
                    q.Match(q.Index("product_search_by_unitprice_"), 33.09),
                    q.Match(q.Index("product_search_by_productname_"), "Fantastic Metal Ball")  
                ) 
            ),
            q.Index('product_sort_by_unitprice_asc_')
        )
    )

    let filter = {
        $or:[
            { product_search_by_unitprice_ : 33.09 },
            { product_search_by_productname_:"Fantastic Metal Ball" },
        ]
    }
    

   let query = orm
    .collection('Product')
    .where(filter)
    .viewBy('product_sort_by_unitprice_asc_')
    .limit(10)
    .before(200)
    .get();

  expect(fauna_query).toEqual(query)
});


test('$not Satement $not:[{ key:value },{ key2:value2 }]', () => {

    let fauna_query = q.Paginate(
        q.Join(
            q.Intersection(
                q.Difference(
                    q.Match(q.Index("allProducts")),
                    q.Union(
                        q.Match(q.Index("product_search_by_productname_"), "Grape"),
                        q.Match(q.Index("product_search_by_productname_"), "Fantastic Granite Chicken"),
                        q.Match(q.Index("product_search_by_productname_"), "Generic Cotton Fish")
                    )
                )
            ),
            q.Index('product_sort_by_unitprice_asc_')
        )
    )

    let filter = {
        $not:[
            { product_search_by_productname_:"Grape" },
            { product_search_by_productname_:"Fantastic Granite Chicken" },
            { product_search_by_productname_:"Generic Cotton Fish" },
        ]
    }
    

   let query = orm
    .collection('Product')
    .where(filter)
    .viewBy('product_sort_by_unitprice_asc_')
    .limit(10)
    .before(200)
    .get();

  expect(fauna_query).toEqual(query)
});


test('Complex Query Statement with $and $or and $not', () => {

    let fauna_query = q.Paginate(
        q.Join(
            q.Intersection(
                q.Union(
                    q.Intersection(
                        q.Match(q.Index("product_search_by_unitprice_"), 48.53),
                        q.Match(q.Index("product_search_by_productname_"), "Fantastic Metal Ball")  
                    ),     
                    q.Union(
                        q.Match(q.Index("product_search_by_productname_"), "Refined Wooden Tuna"),
                        q.Match(q.Index("product_search_by_productname_"), "Gorgeous Soft Soap")
                    ),       
                    q.Intersection(
                        q.Match(q.Index("product_search_by_unitprice_"), 69.97),
                        q.Difference(
                            q.Match(q.Index("allProducts")),
                            q.Union(
                                q.Match(q.Index("product_search_by_productname_"), "Grape"),
                                q.Match(q.Index("product_search_by_productname_"), "Fantastic Granite Chicken"),
                                q.Match(q.Index("product_search_by_productname_"), "Generic Cotton Fish")
                            )
                        )
                    ) 
                )    
            ),
            q.Index('product_sort_by_unitprice_asc_')
        )     
    ) 

    let filter = {
        $or:[
            {
                $and:[
                    { product_search_by_unitprice_:48.53 },
                    { product_search_by_productname_:"Fantastic Metal Ball" },
                ]
            },
            {
                $or:[
                    { product_search_by_productname_:"Refined Wooden Tuna" },
                    { product_search_by_productname_:"Gorgeous Soft Soap" },
                ]
            },
            {
                $and:[
                    { product_search_by_unitprice_:69.97 },
                    {
                        $not:[
                            { product_search_by_productname_:"Grape" },
                            { product_search_by_productname_:"Fantastic Granite Chicken" },
                            { product_search_by_productname_:"Generic Cotton Fish" },
                        ]
                    }
                ]
            }
        ]
        
    }
    

   let query = orm
    .collection('Product')
    .where(filter)
    .viewBy('product_sort_by_unitprice_asc_')
    .limit(10)
    .before(200)
    .get();

  expect(fauna_query).toEqual(query)
});



test('$in Satement $in:["value", "value2", "value3", "value4"]', () => {

    let fauna_query = q.Paginate(
        q.Join(    
            q.Intersection(
                q.Union(                
                    q.Match(q.Index("product_search_by_productname_"), "Fantastic Metal Ball"),
                    q.Match(q.Index("product_search_by_productname_"), "Grape"),
                    q.Match(q.Index("product_search_by_productname_"), "Fantastic Granite Chicken"),
                    q.Match(q.Index("product_search_by_productname_"), "Generic Cotton Fish"),
                ) 
            ),
            q.Index('product_sort_by_unitprice_asc_')
        )
    )

    let filter = {
        product_search_by_productname_:{
            $in:["Fantastic Metal Ball", "Grape", "Fantastic Granite Chicken", "Generic Cotton Fish"]
        }
    }
    

   let query = orm
    .collection('Product')
    .where(filter)
    .viewBy('product_sort_by_unitprice_asc_')
    .limit(10)
    .before(200)
    .get();

  expect(fauna_query).toEqual(query)
});



test('$nin Satement $nin:["value", "value2", "value3", "value4"]', () => {

    let fauna_query = q.Paginate(
        q.Join(    
            q.Intersection(
                q.Difference(
                    q.Match(q.Index("allProducts")),
                    q.Union(
                        q.Match(q.Index("product_search_by_productname_"), "Grape"),
                        q.Match(q.Index("product_search_by_productname_"), "Fantastic Granite Chicken"),
                        q.Match(q.Index("product_search_by_productname_"), "Generic Cotton Fish")
                    )
                )
            ),
            q.Index('product_sort_by_unitprice_asc_')
        )
    )

    let filter = {
        product_search_by_productname_:{
            $nin:["Grape", "Fantastic Granite Chicken", "Generic Cotton Fish"]
        }
    }
    

   let query = orm
    .collection('Product')
    .where(filter)
    .viewBy('product_sort_by_unitprice_asc_')
    .limit(10)
    .before(200)
    .get();

  expect(fauna_query).toEqual(query)
});


test(`Simple Range Satement One Parameter created_at:{ '$range':[from, to] }`, () => {

    let fauna_query = q.Paginate(
        q.Join(    
            q.Intersection(
                q.Join(                              
                    q.Range(q.Match(q.Index("product_range_by_unitprice")), 48.53, 148.53),
                    q.Index("product_range_by_unitprice_all")                        
                )
            ),
            q.Index('product_sort_by_unitprice_asc_')
        )
    )

    let filter = {
        product_range_by_unitprice: { '$range':[48.53, 148.53] }
    }

   let query = orm
    .collection('Product')
    .where(filter)
    .viewBy('product_sort_by_unitprice_asc_')
    .limit(10)
    .before(200)
    .get();

    // console.dir(query.toString(), { depth:null});
    
  expect(fauna_query).toEqual(query)
});