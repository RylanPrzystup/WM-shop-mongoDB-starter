// api.js: everything the PAGE says to the SERVER lives in this file.
// The server keeps the inventory in MongoDB. (Your cart is in db.js, in IndexedDB.)
// cart.js calls these functions. YOU write them, one day at a time.
// Each one throws "not built yet" until you replace that line with your code.

// ALREADY DONE: fetch does NOT throw on a 404 or a 500. readJSON() reads the server's answer.
// If the status is OK, it gives back the data. If not, it throws the server's error message.
async function readJSON(response) {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error);
    error.name = `Error ${response.status}`;
    throw error;
  }
  return data;
}

// ALREADY DONE: the "not built yet" errors. cart.js knows to skip a check that isn't built.
function notBuilt(text) {
  const error = new Error(text);
  error.notBuilt = true;
  return error;
}

// ALREADY DONE (your example): GET /api/status
// Gives back { database, where, collections } for the green status line.
async function getStatus() {
  const response = await fetch("/api/status");
  return readJSON(response);
}

// ALREADY DONE: POST /api/reset puts the first six products back (the Reset inventory button).
async function resetInventory() {
  const response = await fetch("/api/reset", { method: "POST" });
  return readJSON(response);
}

// ---------- Day 3: READ ----------
// Gives back an array of every product (from GET /api/products).
async function getProducts() {
  throw notBuilt("getProducts() is not built yet (Day 3)");
}

// ---------- Day 4: CREATE ----------
// product: { id, name, price, emoji, stock } from the Inventory form.
// Asks the server to add it to the store (POST /api/products).
async function createProduct(product) {
  throw notBuilt("createProduct() is not built yet (Day 4)");
}

// ---------- Day 4: UPDATE ----------
// id: which product. amount: how many to add (5) or take away (-1).
// Asks the server to change that product's stock (PATCH /api/products/:id/stock).
async function changeStock(id, amount) {
  throw notBuilt("changeStock() is not built yet (Day 4)");
}

// ---------- Day 5: the server says no ----------
// items: [{ id, qty }]. Asks the server if this cart can be bought (POST /api/check).
async function checkItems(items) {
  throw notBuilt("checkItems() is not built yet (Day 5)");
}

// items: [{ id, qty }]. Asks the server to sell them (POST /api/checkout).
async function checkout(items) {
  throw notBuilt("checkout() is not built yet (Day 5)");
}
