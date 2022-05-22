const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port=process.env.PORT||5000;
 
const app=express();
 
//middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkt9n.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const productCollection=client.db('StoreService').collection('product');
        app.get('/product',async(req,res)=>{
            const cursor= await productCollection.find().toArray();
            res.send(cursor)
        })
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