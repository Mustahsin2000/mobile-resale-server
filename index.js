const express = require('express');

const app = express();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const cors = require('cors');

const jwt = require('jsonwebtoken');
const { query } = require('express');

require('dotenv').config()

//resaleMobile
//guSuoD1wROAhp1vN
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
  res.send('mobile resale is running');
})

//resaleMobile
//



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wfblndv.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  console.log(req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send('unauthorized access')
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'forbidden access' });
    }
    req.decoded = decoded;
    next();
  })
}

async function run() {
  try {
    const categoriesCollection = client.db('resaleMobile').collection('categories');
    const productsCollection = client.db('resaleMobile').collection('products');
    const bookingsCollection = client.db('resaleMobile').collection('bookings');
    const userCollection = client.db('resaleMobile').collection('users');
    const productCollection = client.db('resaleMobile').collection('addproducts');
    const paymentsCollection = client.db('resaleMobile').collection('payments');
    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user?.role !== 'admin') {
        return res.status(403).send({ message: 'forbidden access' });
      }
      next();

    }

    // const verifySeller = async (req, res, next) => {
    //  console.log(req.decoded.email);
    //  next();

    // }

    app.get('/categories', async (req, res) => {
      const query = {};
      const category = await categoriesCollection.find(query).toArray();
      res.send(category);
    })

    app.get('/categories/:id', async (req, res) => {
      const id = req.params.id;
      const cursor = productsCollection.filter(category => category.category === category);
      const products = await cursor.toArray();
      res.send(products);
    })


    app.get('/products', async (req, res) => {
      const query = {};
      const category = await productsCollection.find(query).toArray();
      res.send(category);
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { id: parseInt(id) };
      const cursor = productsCollection.find(query);
      const product = await cursor.toArray();
      res.send(product);
    });

    app.get('/bookings',async (req, res) => {
      const email = req.query.email;
      // const decodedEmail = req.decoded.email;
      // if (email !== decodedEmail) {
      //   return res.status(403).send({ message: 'forbidden access' });
      // }
      // //   console.log(req.headers.authorization);
      const query = { email: email };
      const bookings = await bookingsCollection.find(query).toArray();
      res.send(bookings);
    })

    // app.get('/bookings/:id',async (req,res)=>{
    //   const id = req.params.id;
    //   const query = {_id:ObjectId(id)};
    //   const booking = await bookingsCollection.findOne(query);
    //   res.send(booking);
    // })

    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    })

    app.post('/create-payment-intent',async(req,res)=>{
      const productspay = req.body;
      const price  = productspay.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency:'usd',
        amount:amount,
        "payment_method_types":[
          "card"
        ]
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });


    app.post('/payments',async (req,res)=>{
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.bookingId;
      const filter = {_id:ObjectId(id)}
      const updatedDoc = {
        $set:{
          paid:true,
          trasectionId:payment.trasectionId,
        }
      }
      const updatedResult = await productCollection.updateOne(filter,updatedDoc);
      res.send(result);
    })
  

    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email }
      const user = await userCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN,{ expiresIn: '5h' })
        return res.send({ accessToken: token })
      }
      console.log(user);
      res.status(403).send({ accessToken: ' ' })
    })


    app.get('/users', async (req, res) => {
      const query = {};
      const users = await userCollection.find(query).toArray();
      res.send(users);
    })

    app.get('/users/admin/:email',async(req,res)=>{
      const email = req.params.email;
      const query = {email};
      const user = await userCollection.findOne(query);
      res.send({isAdmin: user?.role === 'admin'});
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    app.put('/users/admin/:id', async (req, res) => {
      // const decodeEmail = req.decoded.email;
      // const query = {email:decodeEmail};
      // const user = await userCollection.findOne(query);

      // if(user?.role !== 'admin'){
      //   return res.status(403).send({message:'forbidden access'})
      // }
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: 'admin'
        }
      }
      const result = await userCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    })

    app.get('/addproducts/:id',async(req,res)=>{
      const id = req.params.id;
      const query = {_id:ObjectId(id)};
      const booking = await productCollection.findOne(query);
      res.send(booking);
    })



    // //seller
    // app.put('/users/seller/:id',verifyJWT, async (req, res) => {
    //   const decodeEmail = req.decoded.email;
    //   const query = {email:decodeEmail};
    //   const user = await userCollection.findOne(query);

    //   if(user?.role !== 'seller'){
    //     return res.status(403).send({message:'forbidden access'})
    //   }
    //   const id = req.params.id;
    //   const filter = { _id: ObjectId(id) };
    //   const options = { upsert: true };
    //   const updatedDoc = {
    //     $set: {
    //       role: 'seller'
    //     }
    //   }
    //   const result = await userCollection.updateOne(filter, updatedDoc, options);
    //   res.send(result);
    // })

    app.get('/addproducts', async(req,res)=>{
      const query = {};
      const products = await productCollection.find(query).toArray();
      res.send(products);
    })

    app.post('/addproducts',async(req,res)=>{
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    })

    app.delete('/addproducts/:id',async(req,res)=>{
      const id = req.params.id;
      const filter = {_id:ObjectId(id)};
      const result = await productCollection.deleteOne(filter);
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
  finally {

  }

}
run().catch(console.log)


app.listen(port, () => console.log(`Mobile resale programming ${port}`))