import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import joi from "joi";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(json());
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URL);
let db = null;
mongoClient.connect(() => {
    db = mongoClient.db(process.env.DATABASE);
});

app.post("/", async (req, res) => {
    const { email, password } = req.body;
    const userData = {
        email,
        password
    }
    const userSchema = joi.object({
        email: joi.string().email().required().email(),
        password: joi.string().alphanum().min(6).max(10).required()
    });

    const { error } = userSchema.validateAsync(userData, { abortEarly: false });

    if (error) {
        res.status(422).send(error.details.map(detail => detail.message));
        return;
    }

    try {
        const userValidation = await db.collection("users").findOne({ email });
        if (userValidation && bcrypt.compareSync(password, userValidation.password)) {
            res.status(200).send(userValidation);
        } else {
            res.sendStatus(404);
            return;
        }
    }
    catch {
        res.sendStatus(500);
    }
});

app.post("/sign-up", async (req, res) => {
    const { name, email, password, passwordConfirmation } = req.body;
    const userData = {
        name,
        email,
        password,
        passwordConfirmation
    }
    const userSchema = joi.object({
        name: joi.string().required(),
        email: joi.string().email().required().email(),
        password: joi.string().alphanum().min(6).max(10).required(),
        passwordConfirmation: joi.string().alphanum().min(6).max(10).required()
    });

    const { error } = userSchema.validateAsync(userData, { abortEarly: false });

    if (error) {
        res.status(422).send(error.details.map(detail => detail.message));
        return;
    }

    try {
        const passwordHash = bcrypt.hashSync(password, 10)
        const userValidation = await db.collection("users").findOne({ email });
        if (userValidation) {
            res.sendStatus(409);
            return;
        }

        if ((password !== passwordConfirmation)) {
            res.sendStatus(422);
            return;
        } else {
            delete userData.passwordConfirmation;
        }

        await db.collection("users").insertOne({ ...userData, password: passwordHash });
        res.sendStatus(201);

    }
    catch {
        res.sendStatus(500);
    }
});

const port = process.env.PORT || 5500;

app.listen(port);