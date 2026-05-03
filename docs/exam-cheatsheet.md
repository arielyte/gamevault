# GameVault Exam Cheatsheet

## 30-Second Project Explanation

GameVault is a responsive vanilla HTML, CSS, and JavaScript website that helps users discover live discounted PC game deals. It uses the CheapShark API with `fetch` and `async/await`, filters out invalid non-deals, removes duplicate games, renders views dynamically, and lets users save favorite deals in LocalStorage.

## 2-Minute Project Explanation

GameVault is a single-page style static website built without frameworks, packages, backend code, or build tools. The permanent HTML shell is in `index.html`, and the dynamic views are rendered inside `<main id="app">`.

Routing is hash-based. `router.js` reads URLs like `#/home`, `#/browse?storeID=1`, and `#/game/{dealID}`. `app.js` is the controller: it reads the route, calls the CheapShark API through `api.js`, sends normalized data to `render.js`, and connects event listeners after rendering.

`api.js` loads deals from CheapShark, maps raw API fields into the object shape the UI expects, filters invalid deals with `isValidDeal()`, and deduplicates repeated games with `deduplicateDeals()`. `storage.js` saves and removes favorites using LocalStorage under `gamevault-favorites`.

The site has Home, Browse, Categories, Favorites, and Details views. Browse supports search, store filter, max price filter, and CheapShark sort options. Details shows deal intelligence like sale price, retail price, savings, store, ratings, historical low, and other current deals. CSS creates the responsive dark galaxy/glass design using variables, Grid, Flexbox, and media queries.

## File Responsibility Table

| File | Responsibility |
| --- | --- |
| `index.html` | Static page shell, header/nav, `#app` container, footer, stylesheet, ES module script. |
| `css/style.css` | All responsive layout and visual design: galaxy background, glass panels, grids, cards, forms, details, focus states. |
| `js/app.js` | Main controller connecting router, API, rendering, filters, categories, and favorites. |
| `js/api.js` | CheapShark requests, data normalization, valid deal filtering, deduplication, detail mapping, URL helpers. |
| `js/router.js` | Hash route parsing, active nav state, route change listener. |
| `js/render.js` | Dynamic HTML templates for all views, cards, stats, tags, loading/error/empty states. |
| `js/storage.js` | LocalStorage favorites: read, save, check, add, remove. |
| `README.md` | Human-facing project summary, setup, features, API, structure, checklist. |
| `assets/` | Local images: background, hero image, favicon, placeholder. |

## Key Functions Table

| Function | File | What to Say |
| --- | --- | --- |
| `renderCurrentRoute()` | `app.js` | Reads the current route and chooses which view function to run. |
| `showHome()` | `app.js` | Loads deals, takes the first 6, and renders Home. |
| `showBrowse(query)` | `app.js` | Builds filters from the URL, loads deals, applies client filters, renders Browse, connects form. |
| `showCategories()` | `app.js` | Renders category/store shortcuts and connects collection buttons to Browse routes. |
| `showFavorites()` | `app.js` | Reads favorites from LocalStorage, renders them, connects remove buttons. |
| `showGameDetails(gameId)` | `app.js` | Loads one deal by ID and renders the Details view. |
| `connectBrowseControls()` | `app.js` | Turns form values into hash query parameters. |
| `connectFavoriteButton(game)` | `app.js` | Saves/removes the current details deal and rerenders the button state. |
| `applyBrowseFilters()` | `app.js` | Applies search and free-only filtering after API results return. |
| `getGames(filters)` | `api.js` | Fetches deal list, maps, validates, deduplicates, returns UI-ready deals. |
| `getGameDetails(id)` | `api.js` | Fetches one deal detail and maps it for the Details page. |
| `isValidDeal(deal)` | `api.js` | Confirms sale price is lower than retail price and savings are positive. |
| `deduplicateDeals(deals)` | `api.js` | Keeps only the best deal for each game. |
| `mapDealToGame(deal)` | `api.js` | Converts CheapShark list item into a GameVault card object. |
| `mapDealDetailsToGame(id, deal)` | `api.js` | Converts CheapShark detail response into a Details object. |
| `getRoute()` | `router.js` | Parses `window.location.hash` into page, ID, and query. |
| `setActiveNav(page)` | `router.js` | Adds `.active` to the current navigation link. |
| `startRouter(renderCurrentRoute)` | `router.js` | Starts hash routing and initial route rendering. |
| `renderHome()` | `render.js` | Renders hero and featured cards. |
| `renderBrowse()` | `render.js` | Renders filters and result cards. |
| `renderCategories()` | `render.js` | Renders store and deal collection cards. |
| `renderFavorites()` | `render.js` | Renders saved favorites or empty state. |
| `renderGameDetails()` | `render.js` | Renders details hero, buttons, stat cards, overview, and other deals. |
| `createGameCard()` | `render.js` | Builds one reusable deal card. |
| `createDetailStats()` | `render.js` | Builds the stat card grid for Details. |
| `getFavorites()` | `storage.js` | Reads favorites array from LocalStorage. |
| `saveFavorites()` | `storage.js` | Writes favorites array to LocalStorage. |
| `isFavorite()` | `storage.js` | Checks if a deal is saved. |
| `addFavorite()` | `storage.js` | Adds a favorite if it is not already saved. |
| `removeFavorite()` | `storage.js` | Removes a favorite by ID. |

## API Flow Summary

1. `app.js` calls `getGames(filters)` or `getGameDetails(id)`.
2. `api.js` calls `fetchStores()` to refresh store names.
3. `request(path)` builds the CheapShark URL and calls `fetch`.
4. Response JSON is parsed.
5. List data goes through `mapDealToGame()`.
6. Detail data goes through `mapDealDetailsToGame()`.
7. `isValidDeal()` removes invalid non-deals.
8. `deduplicateDeals()` keeps one best deal per game.
9. `app.js` sends the final data to `render.js`.

## LocalStorage Flow Summary

1. Details page renders a Save Favorite button.
2. `connectFavoriteButton(game)` attaches a click listener.
3. On save, `createFavoriteSummary(game)` creates a smaller object.
4. `addFavorite()` reads existing favorites with `getFavorites()`.
5. If not already saved, it pushes the deal and calls `saveFavorites()`.
6. `saveFavorites()` writes JSON to `localStorage`.
7. Favorites page reads with `getFavorites()` and renders saved cards.
8. Remove buttons call `removeFavorite(gameId)`.

LocalStorage key:

```js
gamevault-favorites
```

## Search, Filter, and Sort Explanation

Browse filters live in the hash query string, not in hidden global state.

Example:

```text
#/browse?search=halo&storeID=1&maxPrice=10&sortBy=Price
```

- Search becomes CheapShark `title` in `getGames()`, then `filterGamesBySearch()` also checks the returned titles client-side.
- Store becomes CheapShark `storeID`.
- Numeric max price becomes CheapShark `upperPrice`.
- `maxPrice=free` is handled by `filterGamesByMaxPrice()`, because the code needs exact `salePrice === 0`.
- Sort becomes CheapShark `sortBy`.

## Deduplication Explanation

Problem: CheapShark can return multiple deals for the same game.

Solution:

- `deduplicateDeals(deals)` uses a `Map`.
- `getDealKey(deal)` prefers `gameID` or `gameId`.
- If no game ID exists, it uses a normalized lowercase title.
- `isBetterDeal(newDeal, savedDeal)` chooses the higher savings deal.
- If savings are tied, it chooses the lower sale price.

Strong sentence: “Deduplication is O(n) because each deal is visited once and Map lookup is average O(1).”

## Invalid Deal Filtering Explanation

`isValidDeal(deal)` prevents fake discounts from appearing.

A valid deal must have:

- finite sale price,
- finite retail price,
- finite savings,
- retail price greater than zero,
- sale price lower than retail price,
- savings greater than zero.

This removes 0 percent discount non-deals. Free deals are allowed only if they used to cost more than zero and have positive savings.

## Big-O Complexity

Let `n` be the number of deals returned by CheapShark. The project requests up to `60` deals, but Big-O still describes how the algorithm scales.

| Operation | Complexity | Why |
| --- | --- | --- |
| API result processing | O(n) | `mapDealToGame()` maps each result once, then validation and deduplication also scan the list. |
| Filtering/searching | O(n * m) | `filterGamesBySearch()` checks each title; `m` is average title/search comparison cost. For normal explanation, say O(n). |
| Free filtering | O(n) | `filterGamesByMaxPrice()` scans returned games once when `maxPrice === "free"`. |
| Sorting | Usually API-side | Browse sends `sortBy` to CheapShark, so local code does not sort the full list. CheapShark handles it externally. |
| Deduplication | O(n) average | One pass with a `Map`; average O(1) insert/get. |
| Rendering cards | O(n) | `games.map(createGameCard).join("")` creates one card per visible game. |
| Favorites lookup | O(f) | `isFavorite()` scans saved favorites, where `f` is favorites count. |
| Favorites save | O(f) | JSON stringifying the favorites array scales with number of favorites. |
| Favorites remove | O(f) | `removeFavorite()` filters the favorites array once. |
| Details page loading | O(s) | One API detail request plus mapping cheaper stores, where `s` is `cheaperStores.length`. |

## Common Teacher Questions and Strong Answers

### Why did you use hash routing?

Because this is a static frontend-only project with no backend server. Hash routes like `#/browse` let JavaScript switch views without requiring server route configuration.

### Where does the app start?

`index.html` loads `js/app.js` as an ES module. In `app.js`, `startRouter(renderCurrentRoute)` starts the router, and `renderCurrentRoute()` decides which view to show.

### Why is `type="module"` used?

So the project can split JavaScript into files and use `import` / `export` without a build tool.

### How do you fetch API data?

`api.js` has a shared `request(path)` helper that builds the CheapShark URL, calls `fetch`, checks `response.ok`, parses JSON, and returns the data. `getGames()` and `getGameDetails()` use it.

### How do you prevent invalid deals?

`isValidDeal()` checks that sale price, retail price, and savings are numeric, that retail price is above zero, that sale price is lower than retail price, and that savings are positive.

### How do you remove duplicate games?

`deduplicateDeals()` stores deals in a `Map`. The key is game ID when available, otherwise normalized title. If another deal for the same game appears, `isBetterDeal()` keeps the better discount.

### Where are favorites saved?

In browser LocalStorage using the key `gamevault-favorites`. `storage.js` owns all favorite read/write logic.

### Does the project use a backend?

No. It is fully static. It calls the public CheapShark API directly from the browser and stores favorites locally in the browser.

### Why is there both API filtering and client filtering?

CheapShark handles supported filters like title, store, numeric max price, and sort. The project also applies client checks for exact free deals and extra title matching, and always validates/deduplicates results before rendering.

### What happens if the API fails?

The error is caught in `app.js`, and `renderError()` displays a user-facing error state. The API helper also logs the exact request URL and error details to the console.

### How is the design responsive?

CSS uses Grid, Flexbox, responsive max-width containers, and media queries at 600px, 640px, 900px, and 1024px to change buttons, cards, filters, hero, and details layouts.

### What is one thing you would improve in production?

I would avoid inserting unescaped API/user text with `innerHTML`. I would render text with DOM methods or escape values first to reduce XSS risk.

## Common Live Tweak Requests

| Request | Where to Change |
| --- | --- |
| Change accent color | `css/style.css`, `:root`, change `--accent` and possibly `--accent-strong`. |
| Add another max price filter | `js/render.js`, `renderBrowse()`, add another `<option>` under `#max-price`. Numeric values automatically become `upperPrice` in `getGames()`. |
| Change number of featured cards | `js/app.js`, `showHome()`, change `games.slice(0, 6)` to another number. |
| Change sort default | `js/render.js`, `sortOptions`, change the first option label/value, and/or `js/app.js` filter default for `sortBy`. |
| Change empty state text | Browse: `js/app.js`, `renderEmptyInsideResults()`. Favorites: `js/render.js`, `renderFavorites()`. Error/loading: `renderError()` / `renderLoading()`. |
| Add/remove a stat card in Details | `js/render.js`, `createDetailStats()`, edit the `stats` array. |
| Change LocalStorage key | `js/storage.js`, change `FAVORITES_KEY`. Existing saved favorites under the old key will not appear. |
| Add another category/store card | Store links: `js/render.js`, `renderCategories()`. Collection buttons: `dealCollections` array. Browse store dropdown: `stores` array. |
| Change card layout columns | `css/style.css`, media queries for `.game-grid`, especially `min-width: 640px` and `min-width: 1024px`. |
| Update hero text | `js/render.js`, `renderHome()`, inside the `.hero` markup. |
| Change hero image | `js/render.js`, `renderHome()`, update the `src` for `.hero-image`, and place image in `assets/`. |
| Change button style | `css/style.css`, `.button`, `.small-button`, `.button.secondary`, `.button.danger`. |
| Change free badge style | `css/style.css`, `.free-badge`, `.card-free-badge`, `.detail-free-badge`, `.free-price-tag`. |

## Potential Weak Spots to Study

- `innerHTML` is simple but can be risky if untrusted text is inserted. Know how to explain this honestly.
- `renderEmptyInsideResults()` assumes the Browse result grid already exists.
- `connectBrowseControls()` assumes the Browse form exists.
- No automated tests are included.
- README asset list says SVG for favicon/placeholder, but actual files are PNG.
- Favorites are local to one browser and can be cleared.
- API/network failure affects live data.

## Best Defense Sentence

“The code is separated by responsibility: `router.js` decides the view, `app.js` coordinates behavior, `api.js` fetches and normalizes live CheapShark data, `render.js` creates the DOM, `storage.js` persists favorites, and `style.css` handles the responsive visual design.”
