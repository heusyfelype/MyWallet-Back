import express from "express";
import cors from 'cors';
import joi from "joi";
import dotenv from 'dotenv'
import { MongoClient, ObjectId } from "mongodb";


const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();
const mongoClient = new MongoClient(process.env.MONGO_URI);


const promise = mongoClient.connect();
let dataBase;
promise.then(() => {
    dataBase = mongoClient.db("myWallet");
    console.log("Conectado ao banco de dados!");
})
promise.catch(e => console.log("Não Foi possível conectar ao banco", e))
