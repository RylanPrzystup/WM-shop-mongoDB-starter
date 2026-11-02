# MongoDB Cart Starter: Two Databases, Two Jobs

West-MEC Coding Year 2. Your IndexedDB shopping cart gets a **server** and a real **inventory**.

| What | Where it lives | Why there |
| --- | --- | --- |
| **Your cart** | **IndexedDB**, in your browser (`public/db.js`, you built it) | It belongs to one shopper on one device. |
| **The store's products and stock** | **MongoDB**, on the server (`server.js`, you build it this week) | Everyone shares it, and the server has the final say. |

By the end of the week the server says **no** when it should: an item that doesn't exist (404), not enough stock (409), bad data (400). Create new products, restock them, and check out. Open the shop in two browsers: two different carts, the same shelves.

You start on a **practice server** that runs on your own computer: no account, nothing to pay for. When your group does the Atlas setup, you switch to **MongoDB Atlas** (the cloud) by pasting one line into `.env`.

## Setup

1. Open the terminal: **PowerShell**, **Git Bash**, or **Command Prompt** (any one works).
2. Move into your code folder on the Desktop (use your folder's real name):

   ```
   cd Desktop
   cd code
   ```

   Desktop not found? It may be inside OneDrive: `cd OneDrive`, then `cd Desktop`.

3. Clone the shop, then move into it:

   ```
   git clone https://github.com/Xerrath/mongodb-cart-starter.git
   cd mongodb-cart-starter
   ```

4. Install the packages (Express, the MongoDB driver, and the practice server):

   ```
   npm install
   ```

5. Is the practice MongoDB already on this computer? (If you did Day 1, Your First Database, on this computer, you already have it.)

   ```
   npm run check-mongodb
   ```

   **Only if it says NO**: `npm run get-mongodb` and wait until it says `DONE` (a big download).

6. Make your `.env` file: copy `.env.example` and name the copy `.env`. Leave `MONGODB_URI=` empty for now.
7. Start the shop:

   ```
   npm start
   ```

8. Open **http://localhost:3000** in Chrome. Gray line `Inventory not connected: connectDB() is not built yet (Day 2)`? That's right: you build it.

Stop the server with **Ctrl+C**. After you change a server file (`mongo.js`, `server.js`), stop it and `npm start` again. After you change `public/api.js`, just refresh the page.

## The files

| File | What it is | Do you change it? |
| --- | --- | --- |
| `mongo.js` | Connects the server to MongoDB (`inventoryDB`). | **Yes (Day 2)** |
| `server.js` | The Express server and every `/api` route. | **Yes (Days 2 to 4)** |
| `public/api.js` | Every `fetch` the page makes to the server. | **Yes (Days 2 to 4)** |
| `public/db.js` | Your IndexedDB cart (`shopDB`, store `cart`). | No: you built it last unit |
| `public/cart.js` | Draws the page and decides which database each button uses. | No (read it!) |
| `public/index.html`, `global.css`, `images/` | The shop page. | No |
| `setup/` | Practice server, first products, status and reset routes, MongoDB download. | No |
| `.env` | Your connection string. **Never on GitHub.** | Only to switch to Atlas |

![Class diagram](images/cart-server-class-diagram.png)

## See your data

- **Inventory (MongoDB):** any GET route in the browser, like **http://localhost:3000/api/products**. On Atlas: **Data Explorer** (Browse Collections) > `inventoryDB` > `products`.
- **Cart (IndexedDB):** DevTools (F12) > **Application** > **IndexedDB** > `shopDB` > `cart`.
- **Start the inventory over:** the **Reset inventory** button puts the first six products back.

## Switch to Atlas (after your group's Atlas setup)

1. Open `.env`. Paste your connection string after `MONGODB_URI=` (no spaces, no quotes, with your real password in it).
2. Stop the server (Ctrl+C) and `npm start` again.
3. The terminal and the page say **MongoDB Atlas**. The first six products are put in for you. Your cart doesn't change: it's still in your browser.

Back to the practice server: delete everything after `MONGODB_URI=` and restart.

## Stuck?

- **EADDRINUSE or DBPathInUse**: the shop is already running in another terminal. Ctrl+C there.
- **I changed server.js but nothing changed**: stop the server (Ctrl+C) and `npm start` again.
- **Atlas: `querySrv` / timeout errors**: the network may block Atlas. Empty `MONGODB_URI=`, restart, and tell your teacher.
- **Atlas: `bad auth`**: the password in your string is wrong. Check password #2.
- **Start over (practice server)**: stop the server, delete the `.practice-db` folder, `npm start`.

Needs Node.js 20.19 or newer (`node -v` to check).
