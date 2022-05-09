import { Router } from "express";
import { getRecodsController, recordsController, deleteRecordsController } from "../controllers/recordsController.js";

const recordsRouter = Router();

recordsRouter.get("/records", getRecodsController);

recordsRouter.post("/records", recordsController);

recordsRouter.delete("/records/:id", deleteRecordsController);

export default recordsRouter;