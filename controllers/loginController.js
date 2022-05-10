import db from "../db.js";
import { v4 } from "uuid";
import joi from "joi";
import bcrypt from "bcrypt";
import dayjs from "dayjs";

export async function loginController(req, res) {
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
}