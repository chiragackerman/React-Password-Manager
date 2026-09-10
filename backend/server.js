const express = require('express');
require('dotenv').config()
console.log(process.env.MONGO_URI);
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');



// Connection URL
const url = process.env.MONGO_URI;
const client = new MongoClient(url);

// Database Name
const dbName = 'passman';
const app = express();
const port = 3000;
app.use(cors());
app.use(bodyParser.json());

client.connect();

// Get all passwords. 
app.get('/', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const findResult = await collection.find({}).toArray();
    res.json(findResult);
});

// Save a new password. 
app.post('/', async (req, res) => {
    const passwordData = req.body;
    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const insertResult = await collection.insertOne(passwordData);
    res.send({ success: true, result: insertResult });
});

// Delete password by ID.  
app.delete('/', async (req, res) => {
    const { _id } = req.body;
    if (typeof _id !== 'string' || !ObjectId.isValid(_id)) {
        return res.status(400).send({ success: false, error: 'Invalid password ID' });
    }

    const db = client.db(dbName);
    const collection = db.collection('passwords');
    const deleteResult = await collection.deleteOne({
        $or: [
            { _id: new ObjectId(_id) },
            { _id }
        ]
    });

    if (deleteResult.deletedCount === 0) {
        return res.status(404).send({ success: false, error: 'Password not found' });
    }

    res.send({ success: true, result: deleteResult });
});

app.listen(port, () => {
    console.log(`Example app listening on port https://localhost:${port}`);
});