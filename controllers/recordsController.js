import db from "./../db.js";
import { ObjectId } from "mongodb";
import joi from "joi";
import dayjs from "dayjs";

export async function getRecodsController(req, res) {

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer", "").trim();

    let array = [];

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

}

export async function recordsController(req, res) {

    const { authorization } = req.headers;
    const token = authorization?.replace("Bearer", "").trim();

    const { description, value, operator } = req.body;

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
}
export async function deleteRecordsController(req, res) {

    const { id } = req.params;

    try {
        const session = await db.collection("sessions").findOne({ token: id });
        if (session) {
            await db.collection("sessions").deleteOne({ token: id });
            res.sendStatus(201);
        } else {
            res.sendStatus(404);
        }

    } catch {
        res.sendStatus(500);
    }
}
