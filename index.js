const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port=process.env.PORT||5000;
 
const app=express();
 
//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fkt9n.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message:'unauthorize access'})
    }
    const token=authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN,function(err,decoded){
        if(err){
            return res.status(403).send({message:'Forbidden access'})
        }
        req.decoded=decoded;
        next()
    });
}


async function run(){
    try{
        await client.connect();
        const productCollection=client.db('StoreService').collection('product');
        const purchaseCollection=client.db('StoreService').collection('purchase');
        const userCollection=client.db('StoreService').collection('user');
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
        app.get('/purchase',verifyJWT, async(req,res)=>{
            const email=req.query.email;
            const query={email:email};
            const orders=await purchaseCollection.find(query).toArray();
            res.send(orders);
        })
        //user info
        app.put('/user/:email',async(req,res)=>{
            const email=req.params.email;
            const user=req.body;
            const filter={email: email};
            const options={upsert:true};
            const updateDoc={
                $set:user,
            };
            const result=await userCollection.updateOne(filter,updateDoc,options);
            const token=jwt.sign({email:email},process.env.ACCESS_TOKEN,{expiresIn:'1d'})
            res.send({result,accessToken:token});
        });

        // purchase 
        app.post('/purchase',async(req,res)=>{
            const newPurchase=req.body;
            const result=await purchaseCollection.insertOne(newPurchase);
            res.send(result);
        })
        // delete order
        app.delete('/purchase/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const result=await purchaseCollection.deleteOne(query);
            res.send(result)
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