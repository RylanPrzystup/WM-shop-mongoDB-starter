// mongo.js: connects the SERVER to MongoDB, where the store's inventory lives.
// (The cart is NOT here: it stays in IndexedDB, in public/db.js.)
// YOU write connectDB on Day 2. Replace the throw line with your code.
import { MongoClient } from "mongodb";
import { getMongoURI } from "./setup/practice-server.js";

const DB_NAME = "inventoryDB";

// ---------- Day 2: Connect ----------
// Gets the connection string, connects a MongoClient to it,
// and gives back (a promise for) the inventoryDB database.
export async function connectDB() {
  throw new Error("connectDB() is not built yet (Day 2)");
}
