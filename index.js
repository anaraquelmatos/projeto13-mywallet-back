import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";
import joi from "joi";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import dayjs from "dayjs";

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
            const token = v4();
            res.status(200).send(token);
            await db.collection("sessions").insertOne({ token, userId: userValidation._id, timeSession: dayjs().format("HH:mm:ss") });
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
        email: joi.string().email().required(),
        password: joi.string().alphanum().min(6).max(10).required(),
        passwordConfirmation: joi.string().alphanum().min(6).max(10).required()
    });

    const { error } = userSchema.validateAsync(userData, { abortEarly: false });

    if (error) {
        res.status(422).send(error.details.map(detail => detail.message));
        return;
    }

    try {
        const passwordHash = bcrypt.hashSync(password, 10);
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

app.get("/records", async (req, res) => {

    const { authorization } = req.headers;

    let array = [];

    const token = authorization?.replace("Bearer", "").trim();
    if (!token) return res.sendStatus(401);

    const session = await db.collection("sessions").findOne({ token });
    if (!session) return res.sendStatus(401);

    const user = await db.collection("users").findOne({ _id: new ObjectId(session.userId) });
    if (!user) return res.sendStatus(404);
    delete user._id;
    delete user.password;

    const records = await db.collection("records").find({ userId: new ObjectId(session.userId) }).toArray();

    for (let i = 0; i < records.length; i++) {
        if (records[i].description && records[i].value && records[i].day) {
            array.push(records[i]);
        }
    }


    res.send({ list: array, name: user.name })

});

app.post("/records", async (req, res) => {

    const { description, value, operator } = req.body;

    const { authorization } = req.headers;

    const token = authorization?.replace("Bearer", "").trim();
    if (!token) return res.sendStatus(401);

    const userData = {
        value,
        description,
        operator
    }
    const userSchema = joi.object({
        value: joi.number().required(),
        description: joi.required(),
        operator: joi.boolean().required()
    });

    const { error } = userSchema.validateAsync(userData, { abortEarly: false });

    if (error) {
        res.status(422).send(error.details.map(detail => detail.message));
        return;
    }

    try {
        const user = await db.collection("sessions").findOne({ token });
 
        const session = await db.collection("sessions").findOne({ userId: new ObjectId(user.userId) });
        if (!session) {
            res.sendStatus(404);
            return;
        }

        await db.collection("records").insertOne({ ...userData, day: dayjs().format("DD/MM"), userId: session.userId });
        res.sendStatus(201);

    }
    catch {
        res.sendStatus(500);
    }
});

const port = process.env.PORT || 9000;

app.listen(port);