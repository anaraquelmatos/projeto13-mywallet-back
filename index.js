import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { signUpController } from "./controllers/signUpController.js";
import { loginController } from "./controllers/loginController.js";
import recordsRouter from "./routes/recordsRouter.js";

const app = express();
app.use(cors());
app.use(json());
dotenv.config();

app.post("/", loginController);

app.post("/sign-up", signUpController);

app.use(recordsRouter);

const port = process.env.PORT || 9000;

app.listen(port);