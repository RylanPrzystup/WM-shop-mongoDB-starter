// setup/shop.js: ALREADY DONE. You don't need to change this file.
// Connects with YOUR connectDB(), puts the first products in the products collection
// (only when it's empty, so the items you create stay), and adds two routes:
//   GET /api/status   the green line on the page
//   POST /api/reset   the Reset inventory button: puts the first products back
import { PRODUCTS } from "./products.js";
import { where } from "./practice-server.js";

export async function setUpShop(app, connectDB) {
  let db = null;
  let problem = null;

  try {
    db = await connectDB();
    const products = db.collection("products");
    if ((await products.countDocuments()) === 0) {
      await products.insertMany(PRODUCTS);
      console.log(`Put ${PRODUCTS.length} products in the products collection`);
    }
    console.log(`Connected to ${db.databaseName} on ${where()}`);
  } catch (error) {
    problem = error;
    db = null;
    console.log(`Database not connected: ${error.message}`);
  }

  app.get("/api/status", async (req, res) => {
    if (!db) {
      return res.status(500).json({ error: problem.message });
    }
    const collections = await db.listCollections().toArray();
    res.json({
      database: db.databaseName,
      where: where(),
      collections: collections.map((c) => c.name).sort(),
    });
  });

  app.post("/api/reset", async (req, res) => {
    if (!db) {
      return res.status(500).json({ error: problem.message });
    }
    await db.collection("products").deleteMany({});
    await db.collection("products").insertMany(PRODUCTS);
    res.json({ reset: PRODUCTS.length });
  });

  return db;
}
