import express from "express";
import cors from 'cors';
import joi from "joi";
import dotenv from 'dotenv'
import { MongoClient, ObjectId } from "mongodb";
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';

//import { signUp, signIn } from './controllers/authController.js';

//const token = uuid();
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
        signUp.password = bcrypt.hashSync(signUp.password, 10);
        const insert = await dataBase.collection("users").insertOne(signUp)
        
        res.status(201).send("Usuário adicionado com sucesso");
        return;

    }catch(e){
        res.send(e);
        console.log(e)
        return;
    }
});


app.post('/sign-in', async (req, res) =>{
    const signIn = req.body;

    const signInSchema = joi.object({
        email: joi.string().email(),
        password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{4,15}$')).required(),
    });

    const validationSignIn = signInSchema.validate(signIn, { abortEarly: false });
    if (validationSignIn.error) {
        res.status(422).send("Foi digitada alguma informação incorretamente", validationSignIn.error.details.message)
        return;
    }

    try{
        const user = await dataBase.collection("users").findOne({email: signIn.email})
        if(!user || !bcrypt.compareSync(signIn.password, user.password)){
            return res.status(422).send("email ou senha errado")
        }
        //const userId = user._id;
        // const tokentest = uuid()
        const onlineUser = {
            name: user.name,
            userId: user._id,
            token: uuid()
        }

        await dataBase.collection("sessions").insertOne({...onlineUser, status: Date.now()})

        return res.status(200).send(onlineUser)
    }catch(e){
        return res.send(e)
    }
})


app.listen(5000, () => {
    console.log("Iniciado na porta 5000")
})