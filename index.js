import express from "express";
import cors from 'cors';
import joi from "joi";
import dotenv from 'dotenv'
import { MongoClient, ObjectId } from "mongodb";


//import { signUp, signIn } from './controllers/authController.js';

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
promise.catch(e => console.log("Não Foi possível conectar ao banco", e));

app.post('/sign-up', async (req, res) =>{
    const signUp = req.body;

    const signUpSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email(),
        password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{4,15}$')).required(),
        confirm_password: joi.ref('password')
    });

    const validationSignUp = signUpSchema.validate(signUp, { abortEarly: false });
    if (validationSignUp.error) {
        res.status(422).send("Foi digitada alguma informação incorretamente", validationLogin.error.details.message)
        return;
    }

    try{
        const find = await dataBase.collection("users").findOne({ email: signUp.email });
        console.log(find)
        if(find){
            console.log("Um usuário tentou se cadastrar com um e-mail já existente no BD");
            return res.status(409).send("E-mail já cadastrado! Por favor use outro.")
        }

        delete signUp.confirm_password
        const insert = await dataBase.collection("users").insertOne(signUp)
        
        res.status(201).send("Usuário adicionado com sucesso");
        return;

    }catch(e){
        res.send(e);
        console.log(e)
        return;
    }
});


app.listen(5000, () => {
    console.log("Iniciado na porta 5000")
})