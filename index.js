const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port=process.env.PORT||5000;
 
const app=express();
 
//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkt9n.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const productCollection=client.db('StoreService').collection('product');
        const purchaseCollection=client.db('StoreService').collection('purchase');
        app.get('/product',async(req,res)=>{
            const cursor= await productCollection.find().toArray();
            res.send(cursor)
        });
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
        })
        // purchase order page add
        app.get('/purchase',async(req,res)=>{
            const email=req.query.email;
            const query={email:email};
            const orders=await purchaseCollection.find(query).toArray();
            res.send(orders);
        })

        // purchase 
        app.post('/purchase',async(req,res)=>{
            const newPurchase=req.body;
            const result=await purchaseCollection.insertOne(newPurchase);
            res.send(result);
        })
        // delete order
        
    }
    finally{

    }
}
run().catch(console.dir)
 
app.get('/',(req,res)=>{
   res.send('running test')
})
 
app.listen(port,()=>{
   console.log("Listening to port",port);
})