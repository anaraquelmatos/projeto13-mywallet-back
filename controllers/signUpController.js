import db from "../db.js";
import joi from "joi";
import bcrypt from "bcrypt";

export async function signUpController(req, res) {
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

}