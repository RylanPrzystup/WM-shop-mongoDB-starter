// setup/products.js: the store's first products. They go in the products collection
// the first time the server starts (and again when you click Reset inventory).
// _id is the product's key, like id was in IndexedDB. stock is how many the store has left.

export const PRODUCTS = [
  { _id: "hoodie", name: "West-MEC Hoodie", price: 38.0, emoji: "🧥", stock: 3 },
  { _id: "tee", name: "Code Crew Tee", price: 18.0, emoji: "👕", stock: 10 },
  { _id: "cap", name: "Snapback Cap", price: 22.5, emoji: "🧢", stock: 5 },
  { _id: "bottle", name: "Water Bottle", price: 15.0, emoji: "🥤", stock: 8 },
  { _id: "stickers", name: "Sticker Pack", price: 4.99, emoji: "🏷️", stock: 25 },
  { _id: "lanyard", name: "Lanyard", price: 6.0, emoji: "🪪", stock: 0 },
];
