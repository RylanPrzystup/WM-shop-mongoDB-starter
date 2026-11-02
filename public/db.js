// db.js: YOUR IndexedDB cart from the Shopping Cart unit. ALREADY DONE: you built this.
// The cart stays in IndexedDB: it belongs to ONE shopper, in ONE browser.
// (The store's inventory is on the server, in MongoDB. That's api.js.)

const DB_NAME = "shopDB";
const DB_VERSION = 1;

// IndexedDB answers with events (onsuccess / onerror), not promises.
// promisify() wraps a request in a promise so you can use await.
function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Opens shopDB. Makes the "cart" store the first time.
function openDB() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains("cart")) {
      db.createObjectStore("cart", { keyPath: "id" });
    }
  };
  return promisify(request);
}

// product: one product from the server.
// Puts it in the cart with qty 1, or adds 1 to qty if it's already there.
async function addToCart(product) {
  const db = await openDB();
  const store = db.transaction("cart", "readwrite").objectStore("cart");

  const item = await promisify(store.get(product._id));

  if (item) {
    item.qty = item.qty + 1;
    await promisify(store.put(item));
  } else {
    await promisify(store.add({
      id: product._id, // MongoDB calls it _id. The cart's keyPath is id.
      name: product.name,
      price: product.price,
      emoji: product.emoji,
      qty: 1,
    }));
  }
}

// Gives back an array of every item in the cart.
async function getCart() {
  const db = await openDB();
  const store = db.transaction("cart").objectStore("cart");
  return promisify(store.getAll());
}

// id: which item. amount: 1 or -1. At 0, the item leaves the cart.
async function changeQuantity(id, amount) {
  const db = await openDB();
  const store = db.transaction("cart", "readwrite").objectStore("cart");

  const item = await promisify(store.get(id));
  item.qty = item.qty + amount;

  if (item.qty < 1) {
    await promisify(store.delete(id));
  } else {
    await promisify(store.put(item));
  }
}

// id: which item. Takes it out of the cart.
async function removeFromCart(id) {
  const db = await openDB();
  const store = db.transaction("cart", "readwrite").objectStore("cart");
  await promisify(store.delete(id));
}

// Empties the whole cart.
async function clearCart() {
  const db = await openDB();
  const store = db.transaction("cart", "readwrite").objectStore("cart");
  await promisify(store.clear());
}
