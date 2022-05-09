import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { signUpController } from "./controllers/signUpController.js";
import { loginController } from "./controllers/loginController.js";
import { getRecodsController, recordsController,deleteRecordsController } from "./controllers/recordsController.js";

const app = express();
app.use(cors());
app.use(json());
dotenv.config();

app.post("/", loginController);

app.post("/sign-up", signUpController);

app.get("/records", getRecodsController);

app.post("/records", recordsController);

app.delete("/records/:id", deleteRecordsController);

const port = process.env.PORT || 9000;

app.listen(port);