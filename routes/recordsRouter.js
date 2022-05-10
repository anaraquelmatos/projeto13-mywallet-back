import { Router } from "express";
import { getRecodsController, recordsController, deleteRecordsController } from "../controllers/recordsController.js";
import validHeader from "../middlewares/userMiddleware.js";

const recordsRouter = Router();

recordsRouter.get("/records", validHeader, getRecodsController);

recordsRouter.post("/records", validHeader, recordsController);

recordsRouter.delete("/records/:id", validHeader, deleteRecordsController);

export default recordsRouter;