const express = require('express');

const app = express();

const { MongoClient, ServerApiVersion } = require('mongodb');

const cors = require('cors');

require('dotenv').config()

//resaleMobile
//guSuoD1wROAhp1vN

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/',async (req,res)=>{
    res.send('mobile resale is running');
})

//resaleMobile
//



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wfblndv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
     const categoriesCollection = client.db('resaleMobile').collection('categories');
     const productsCollection = client.db('resaleMobile').collection('products');
     const bookingsCollection = client.db('resaleMobile').collection('bookings');
     const userCollection = client.db('resaleMobile').collection('users');

     app.get('/categories',async(req,res)=>{
        const query={};
        const category = await categoriesCollection.find(query).toArray();
        res.send(category);
     })

     app.get('/categories/:id',async(req,res)=>{
      const id = req.params.id;
      const cursor = productsCollection.filter(category=>category.category === category);
      const products = await cursor.toArray();
      res.send(products);
     })


     app.get('/products',async(req,res)=>{
        const query={};
        const category = await productsCollection.find(query).toArray();
        res.send(category);
     })

     app.get('/products/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {id:parseInt(id)};
      const cursor = productsCollection.find(query);
      const product = await cursor.toArray();
      res.send(product);
     });

     app.get('/bookings',async(req,res)=>{
      const email = req.query.email;
      const query = {email:email};
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
     })

     app.post('/bookings',async(req,res)=>{
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
     })

     app.post('/users',async(req,res)=>{
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result);
     })

   //   app.get('/categories/:id',async(req,res)=>{
   //      const id = req.params.id;
   //      const query = {id:parseInt(id)}
   //      const cursor = productsCollection.find(query);
   //      const product = await cursor.toArray();
   //      res.send(product);
   //   })

   // //  samsung products
   //   app.get('/samsung',async(req,res)=>{
   //      const filter ={category:"samsung"}
   //      const filtering = await productsCollection.find(filter)
   //      const filtering3 = await filtering.toArray(filtering)
   //      res.send(filtering3)
   //   })

   //   //iphone 
   //   app.get('/iPhone',async(req,res)=>{
   //      const filter ={category:'iPhone'}
   //      const filtering = await productsCollection.find(filter)
   //      const filtering3 = await filtering.toArray(filtering)
   //      res.send(filtering3)
   //   })

   //   //  onePlus products getting 
   //   app.get('/oneplus',async(req,res)=>{
   //      const filter ={category:'oneplus'}
   //      const filtering = await productsCollection.find(filter)
   //      const filtering3 = await filtering.toArray(filtering)
   //      res.send(filtering3)
   //   })


    }
    finally{

    }

}
run().catch(console.log)


app.listen(port,()=>console.log(`Mobile resale programming ${port}`))