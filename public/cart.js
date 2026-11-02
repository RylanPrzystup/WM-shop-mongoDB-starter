// cart.js: draws the page and decides WHICH database each button talks to.
//   The cart (one shopper, this browser)   -> db.js  -> IndexedDB
//   The inventory (everyone, the server)   -> api.js -> your server -> MongoDB
// You do NOT need to change this file. Read it to see WHEN each function runs.

const productList = document.querySelector("#product-list");
const cartList = document.querySelector("#cart-list");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const clearButton = document.querySelector("#clear-cart");
const checkoutButton = document.querySelector("#checkout");
const inventoryList = document.querySelector("#inventory-list");
const productForm = document.querySelector("#product-form");
const dbStatus = document.querySelector("#db-status");
const message = document.querySelector("#message");
const messageText = document.querySelector("#message-text");
const notice = document.querySelector("#notice");
const noticeText = document.querySelector("#notice-text");

// The products, once getProducts() brings them from the server.
let products = [];

function money(amount) {
  return "$" + amount.toFixed(2);
}

// Red message at the top: something went wrong, or the server said no.
function showMessage(error) {
  console.error(error);
  notice.classList.add("hidden");
  messageText.textContent = `${error.name}: ${error.message}`;
  message.classList.remove("hidden");
}

// Green message at the top: it worked.
function showNotice(text) {
  message.classList.add("hidden");
  noticeText.textContent = text;
  notice.classList.remove("hidden");
}

function hideMessages() {
  message.classList.add("hidden");
  notice.classList.add("hidden");
}

document.querySelector("#message-close").addEventListener("click", hideMessages);
document.querySelector("#notice-close").addEventListener("click", hideMessages);

// Swaps a button's text for a moment ("Added ✓"), then puts it back.
function flash(button, text) {
  const original = button.innerHTML;
  button.innerHTML = text;
  button.disabled = true;
  setTimeout(() => {
    button.innerHTML = original;
    button.disabled = false;
  }, 900);
}

// Asks the server if these items can be bought (Day 5: checkItems).
// Until you build checkItems, the page skips this check.
async function askServer(items) {
  try {
    await checkItems(items);
  } catch (error) {
    if (error.notBuilt) return;
    throw error;
  }
}

// ---------- Status line: where each database lives ----------
async function renderStatus() {
  const cartPart = `<span class="text-navy/60">·</span> <span class="text-navy/80">Cart: <b>IndexedDB</b> in this browser</span>`;
  try {
    const status = await getStatus();
    const collections = status.collections.join(", ") || "none yet";
    dbStatus.innerHTML = `<span class="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_0_3px] shadow-green-500/25"></span><span class="text-green-800">Inventory: <b>${status.database}</b> on <b>${status.where}</b>. Collections: <b>${collections}</b></span> ${cartPart}`;
  } catch (error) {
    dbStatus.innerHTML = `<span class="h-2.5 w-2.5 rounded-full bg-navy/25"></span><span class="text-navy/60">Inventory not connected: ${error.message}</span> ${cartPart}`;
  }
}

// ---------- Products (Day 3: getProducts) ----------
function stockBadge(stock) {
  if (stock === 0) return `<span class="rounded-md bg-flame px-2 py-0.5 text-sm font-bold text-white">Sold out</span>`;
  if (stock <= 3) return `<span class="rounded-md bg-navy px-2 py-0.5 text-sm font-bold text-white">Only ${stock} left</span>`;
  return `<span class="text-sm font-semibold text-navy/60">${stock} in stock</span>`;
}

async function renderProducts() {
  try {
    products = await getProducts();
  } catch (error) {
    products = [];
    productList.innerHTML = `<p class="rounded-xl border-2 border-dashed border-navy/20 px-4 py-6 text-center text-navy/60 lg:col-span-3">${error.message}</p>`;
    return;
  }

  productList.innerHTML = products.map((product) => `
    <article class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-navy/5 transition duration-200 hover:-translate-y-1.5 hover:shadow-xl">
      <div class="dots relative grid h-28 place-items-center lg:h-36">
        <span class="text-6xl drop-shadow-lg transition duration-200 group-hover:scale-110 group-hover:-rotate-6">${product.emoji}</span>
        <img src="./images/chevrons-lined-white.png" alt="" class="absolute bottom-2 right-2 w-14 opacity-60">
      </div>
      <div class="flex flex-1 flex-col p-4">
        <h3 class="font-display text-xl font-bold uppercase italic leading-tight">${product.name}</h3>
        <p class="mt-1 mb-4 flex flex-wrap items-center gap-2">
          <span class="rounded-md bg-orange px-2 py-0.5 font-bold text-navy">${money(product.price)}</span>
          ${stockBadge(product.stock)}
        </p>
        <button data-action="add" data-id="${product._id}" ${product.stock === 0 ? "disabled" : ""}
          class="mt-auto rounded-lg bg-navy px-3 py-2.5 font-display text-base font-bold uppercase italic tracking-wide text-white transition hover:bg-linear-to-r hover:from-sunrise hover:to-flame active:scale-95 disabled:cursor-not-allowed disabled:bg-navy/30 disabled:hover:bg-none">
          ${product.stock === 0 ? "Sold out" : "Add to cart »"}
        </button>
      </div>
    </article>
  `).join("");
}

// ---------- Cart (IndexedDB: db.js) ----------
async function renderCart() {
  try {
    const items = await getCart();

    if (items.length === 0) {
      cartList.innerHTML = `<li class="rounded-xl border-2 border-dashed border-white/20 px-4 py-6 text-center text-white/60">Your cart is empty. <a href="#products" class="font-semibold text-orange hover:underline">Gear up »</a></li>`;
    } else {
      cartList.innerHTML = items.map((item) => `
        <li class="flex items-center gap-3 rounded-xl bg-white/5 p-2 ring-1 ring-white/10">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-linear-to-br from-sunrise to-flame text-2xl">${item.emoji}</span>
          <div class="min-w-0 flex-1">
            <p class="font-semibold leading-tight">${item.name}</p>
            <p class="text-sm text-white/60">${money(item.price)} each</p>
          </div>
          <div class="flex items-center gap-1">
            <button data-action="minus" data-id="${item.id}" aria-label="One less" class="h-7 w-7 rounded-md bg-white/10 font-bold hover:bg-orange hover:text-navy">−</button>
            <span class="w-6 text-center font-display text-lg font-bold">${item.qty}</span>
            <button data-action="plus" data-id="${item.id}" aria-label="One more" class="h-7 w-7 rounded-md bg-white/10 font-bold hover:bg-orange hover:text-navy">+</button>
          </div>
          <button data-action="remove" data-id="${item.id}" aria-label="Remove ${item.name}" class="px-1 text-white/50 hover:text-flame">✕</button>
        </li>
      `).join("");
    }

    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    if (cartCount.textContent !== String(count)) {
      cartCount.classList.remove("bump");
      void cartCount.offsetWidth; // restart the animation
      cartCount.classList.add("bump");
    }
    cartCount.textContent = count;
    cartTotal.textContent = money(total);
    checkoutButton.disabled = items.length === 0;
  } catch (error) {
    cartList.innerHTML = `<li class="rounded-xl border-2 border-dashed border-white/20 px-4 py-4 text-sm text-white/60">${error.message}</li>`;
  }
}

// ---------- Inventory panel (the server: getProducts, changeStock) ----------
function renderInventory() {
  if (products.length === 0) {
    inventoryList.innerHTML = `<li class="text-navy/60">No products to show yet (getProducts, Day 3).</li>`;
    return;
  }
  inventoryList.innerHTML = products.map((product) => `
    <li class="flex items-center gap-3 rounded-xl bg-white p-2 ring-1 ring-navy/10">
      <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-orange/15 text-xl">${product.emoji}</span>
      <div class="min-w-0 flex-1">
        <p class="font-semibold leading-tight">${product.name} <span class="font-mono text-xs text-navy/50">${product._id}</span></p>
        <p class="text-sm text-navy/60">${money(product.price)} · stock <b class="text-navy">${product.stock}</b></p>
      </div>
      <button data-action="stock" data-amount="-1" data-id="${product._id}" class="h-8 rounded-md bg-navy/10 px-2 font-bold hover:bg-orange">−1</button>
      <button data-action="stock" data-amount="1" data-id="${product._id}" class="h-8 rounded-md bg-navy/10 px-2 font-bold hover:bg-orange">+1</button>
      <button data-action="stock" data-amount="5" data-id="${product._id}" class="h-8 rounded-md bg-navy/10 px-2 font-bold hover:bg-orange">+5</button>
    </li>
  `).join("");
}

async function renderAll() {
  await renderStatus();
  await renderProducts();
  renderInventory();
  await renderCart();
}

// ---------- Buttons ----------
// One click listener for the whole page. data-action says which button it was.
document.body.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;

  try {
    if (action === "add" || action === "plus") {
      // How many would be in the cart after this click? Ask the SERVER first (Day 5).
      const cart = await getCart();
      const inCart = cart.find((item) => item.id === id);
      const qty = (inCart ? inCart.qty : 0) + 1;
      await askServer([{ id, qty }]);

      if (action === "add") await addToCart(products.find((p) => p._id === id)); // IndexedDB
      if (action === "plus") await changeQuantity(id, 1);                          // IndexedDB
    }
    if (action === "minus") await changeQuantity(id, -1);                          // IndexedDB
    if (action === "remove") await removeFromCart(id);                             // IndexedDB
    if (action === "stock") await changeStock(id, Number(button.dataset.amount));  // Day 4
    if (action === "reset") await resetInventory();                                // given
    hideMessages();
    if (action === "add") flash(button, "Added ✓");
  } catch (error) {
    showMessage(error);
  }

  await renderAll();
});

clearButton.addEventListener("click", async () => {
  try {
    await clearCart(); // IndexedDB
    hideMessages();
  } catch (error) {
    showMessage(error);
  }
  await renderAll();
});

// Checkout: the server sells the items (Day 5). Only if it says yes does the cart get emptied.
checkoutButton.addEventListener("click", async () => {
  try {
    const cart = await getCart();
    const items = cart.map((item) => ({ id: item.id, qty: item.qty }));
    const order = await checkout(items);
    await clearCart();
    showNotice(`Order placed! The server charged ${money(order.total)}.`);
  } catch (error) {
    showMessage(error);
  }
  await renderAll();
});

// New product form (Day 4: createProduct)
productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(productForm);
  const product = {
    id: form.get("id").trim(),
    name: form.get("name").trim(),
    price: form.get("price") === "" ? undefined : Number(form.get("price")),
    emoji: form.get("emoji").trim(),
    stock: form.get("stock") === "" ? undefined : Number(form.get("stock")),
  };
  try {
    const created = await createProduct(product);
    productForm.reset();
    showNotice(`Created ${created.name} (${created._id}).`);
  } catch (error) {
    showMessage(error);
  }
  await renderAll();
});

// ---------- Start ----------
renderAll();
