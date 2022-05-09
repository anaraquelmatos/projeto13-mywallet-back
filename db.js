import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

let db = null;
const mongoClient = new MongoClient(process.env.MONGO_URL);

try {
   await mongoClient.connect();
   db = mongoClient.db(process.env.DATABASE);
}
catch {
    sendStatus(500);
}

export default db;