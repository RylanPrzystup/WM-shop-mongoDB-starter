// server.js: the shop's server. Express sends the shop page AND answers every /api request.
// The INVENTORY lives here, in MongoDB: every browser shares it, and the server has the final say.
// YOU write the routes, one day at a time. Each one answers 501 "not built yet" until you build it.
import express from "express";
import { connectDB } from "./mongo.js";
import { setUpShop } from "./setup/shop.js";

const PORT = 3000;
const app = express();

// Sends the shop page (everything in the public folder) to the browser.
app.use(express.static("public"));

// ---------- Day 4: read JSON bodies ----------


// ALREADY DONE: connects with your connectDB(), fills the products collection the first time,
// adds GET /api/status and POST /api/reset.
const db = await setUpShop(app, connectDB);

// ---------- Day 3: READ ----------
// GET /api/products: sends back an array of every product.
app.get("/api/products", async (req, res) => {
  try{
    const products = await db.collection("products").find().toArray();
    res.json(products);
  }catch(error){
    res.status(500).json({error: error.message})
  }
});

// GET /api/products/:id: sends back ONE product, or 404 if there's no product with that id.
app.get("/api/products/:id", async (req, res) => {
    try{
      
    const id = req.params.id;
    const product = await db.collection("products").findOne({ _id : id })
    if(!product){return res.status(404).json({error: `There is no product with the id ${id}`})}
    res.json(product)
    
    }
      
    catch(error){
      res.status(500).json({ error: error.message })
    }
});

// ---------- Day 4: CREATE ----------
// POST /api/products   body: { "id": "socks", "name": "Team Socks", "price": 9.5, "emoji": "🧦", "stock": 12 }
// Adds a new product to the store. 400 if something is missing, 409 if the id is taken.
app.post("/api/products", async (req, res) => {
  try {
    const { id, name, price, emoji, stock } = req.body;

    if (!id || !name) {
      return res.status(400).json({ error: "id and name are required" });
    }

    if (typeof price !== "number" || price <= 0) {
      return res.status(400).json({ error: "price must be a number more than 0" });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({ error: "stock must be a whole number 0 or more" });
    }

    const product = {
      _id: id,
      name,
      price,
      emoji: emoji || "📦",
      stock
    };

    await products.insertOne(product);

    return res.status(201).json(product);

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: `There is already a product with the id ${req.body.id}`
      });
    }

    return res.status(500).json({ error: "Server error" });
  }
});

// ---------- Day 4: UPDATE ----------
// PATCH /api/products/:id/stock   body: { "amount": 5 } or { "amount": -1 }
// Restocks (or takes away) that product's stock. Stock can never go below 0.
app.patch("/api/products/:id/stock", async (req, res) => {
  try {
    const id = req.params.id;
    const { amount } = req.body;

    if (!Number.isInteger(amount) || amount === 0) {
      return res.status(400).json({
        error: "amount must be a whole number and cannot be 0"
      });
    }

    const product = await products.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.stock + amount < 0) {
      return res.status(400).json({
        error: `Stock can't go below 0 (${product.name} has ${product.stock})`
      });
    }

    await products.updateOne(
      { _id: id },
      { $inc: { stock: amount } }
    );

    const updatedProduct = await products.findOne({ _id: id });

    return res.json(updatedProduct);

  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
});

// ---------- Day 5: the server says no ----------
// POST /api/check   body: { "items": [{ "id": "hoodie", "qty": 2 }] }
// Can this cart be bought? 200 if yes. 404 if an item doesn't exist, 409 if there aren't enough.
// ---------- Day 5: the server says no ----------

// Checks every item against the real stock in MongoDB
async function findProblem(items) {
  for (const item of items) {
    const product = await products.findOne({ id: item.id });

    // Product doesn't exist
    if (!product) {
      return { status: 404, error: `Product ${item.id} not found.` };
    }

    // Not enough stock
    if (product.stock < item.qty) {
      const message = product.stock === 0
        ? `${product.name} is sold out.`
        : `Only ${product.stock} ${product.name} left.`;

      return { status: 409, error: message };
    }
  }

  return null;
}

// POST /api/check
app.post("/api/check", async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid items." });
    }

    const problem = await findProblem(items);

    if (problem) {
      return res.status(problem.status).json({ error: problem.error });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/checkout
app.post("/api/checkout", async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Invalid items." });
    }

    const problem = await findProblem(items);

    if (problem) {
      return res.status(problem.status).json({ error: problem.error });
    }

    let total = 0;

    for (const item of items) {
      const product = await products.findOne({ id: item.id });

      total += product.price * item.qty;

      await products.updateOne(
        { id: item.id },
        { $inc: { stock: -item.qty } }
      );
    }

    total = Math.round(total * 100) / 100;

    res.json({ ok: true, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Shop running at http://localhost:${PORT}  (Ctrl+C to stop)`);
});
