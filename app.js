const express = require("express");
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app =express()
require ("dotenv").config()
const port = process.env.PORT || 4000

// middleware 
app.use(cors())
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eb1zo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
   
    try{
        await client.connect()
        const productCollection = client.db("emajohn").collection("product")

        // get data 
        app.get("/products", async(req,res)=>{
            console.log(req.query);
            const page = parseInt(req.query.page)
            const size = parseInt(req.query.size)
            const query = {}
            const cursor = productCollection.find(query)
            //  এটা বুঝিনি সকালে বুঝতে হবে
            let result
            if(page || size){
                result = await cursor.skip(page * size).limit(size).toArray()
            }
            else{
                result = await cursor.limit(10).toArray()
            }
            
            res.send(result)
        })


        app.get("/pageCount",async(req,res)=>{
            const count = await productCollection.estimatedDocumentCount()
            res.send({count})
        })

        // post data
        app.post("/productsBykeys",async(req,res)=>{
            const keys = req.body
            const ids = keys.map(id => ObjectId(id))
            const query = {_id: {$in: ids}}
            const cursor = productCollection.find(query)
            const result =await cursor.toArray()
            res.send(result)
        })

    }
    finally{}
}
run().catch(console.dir)


app.listen(port,()=>{
    console.log("ema john running",port);
})