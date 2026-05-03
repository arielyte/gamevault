# GameVault Code Walkthrough

This walkthrough explains the current codebase file by file and function by function. It documents what the project does now without proposing rewrites.

## Project Structure

```text
gamevault/
├── index.html
├── README.md
├── assets/
│   ├── blue-galaxy-wallpaper.webp
│   ├── cat.jpg
│   ├── favicon.png
│   └── placeholder.png
├── css/
│   └── style.css
└── js/
    ├── api.js
    ├── app.js
    ├── render.js
    ├── router.js
    └── storage.js
```

## `index.html`

### Responsibility

`index.html` is the static page shell. It does not contain the application views directly. Instead, it provides the permanent layout around the dynamic app:

- Metadata.
- Stylesheet link.
- Header and navigation.
- Main app container.
- Footer credit.
- ES module script.

### Semantic Structure

Important elements:

- `<!DOCTYPE html>` declares HTML5.
- `<html lang="en">` sets the language.
- `<meta charset="UTF-8">` supports normal text encoding.
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` enables responsive layouts.
- `<header class="site-header">` contains logo and nav.
- `<nav class="site-nav" aria-label="Main navigation">` contains main route links.
- `<main id="app" class="app-shell" tabindex="-1"></main>` is the dynamic app area.
- `<footer class="site-footer">` credits CheapShark.

### Navigation

The nav links use hash routes:

- `#/home`
- `#/browse`
- `#/categories`
- `#/favorites`

Each nav link has `data-nav-link`, which `setActiveNav(page)` uses to apply or remove the `.active` class.

### Main App Container

The app container is:

```html
<main id="app" class="app-shell" tabindex="-1"></main>
```

Why it exists:

- JavaScript replaces its `innerHTML` to switch views.
- The `main` element gives the dynamic content semantic meaning.
- `tabindex="-1"` allows `app.focus()` after route changes, which helps keyboard and screen reader users move to the new content.

### ES Module Loading

The script is loaded as:

```html
<script type="module" src="./js/app.js"></script>
```

This allows `app.js` to use `import` statements. Because browser ES modules are used, the project should be served by a static server instead of opened directly from the file system.

## `css/style.css`

### Responsibility

`style.css` contains all project styling:

- CSS variables.
- Base browser reset rules.
- Galaxy background.
- Glass panel style.
- Header, navigation, footer.
- Hero section.
- Browse filters.
- Game cards.
- Category cards.
- Favorites empty state.
- Details page.
- Loading spinner.
- Responsive media queries.
- Focus states.

### Variables

The `:root` block defines design tokens:

- `--bg`: dark base background.
- `--surface`: transparent glass panel background.
- `--surface-strong`: stronger surface background.
- `--surface-light`: lighter image/card background.
- `--text`: main text color.
- `--muted`: secondary text color.
- `--accent`: bright cyan accent.
- `--accent-strong`: stronger cyan.
- `--danger`: pink/red danger color.
- `--border`: soft cyan border.
- `--border-strong`: brighter cyan border.
- `--radius`: shared card/panel radius.
- `--radius-small`: smaller control radius.
- `--shadow`: large dark shadow.
- `--glow`: cyan glow.

These variables make color and shape changes easier during a live tweak. For example, the main accent color is `--accent`.

### Base Styles

Base rules include:

- `* { box-sizing: border-box; }` for predictable sizing.
- `html` and `body` prevent horizontal overflow.
- `body` sets font, text color, and galaxy background image.
- `body::before` creates a fixed dark overlay over the background image.
- `img { display: block; max-width: 100%; }` makes images responsive.
- Form controls inherit the page font.

### Focus States

Keyboard focus is styled with:

```css
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible
```

This gives interactive elements a visible cyan outline. The app container itself removes the outline because JavaScript focuses it after route changes.

### Layout System

Main layout classes:

- `.site-header`, `.site-footer`, `.app-shell`: centered max-width containers.
- `.site-header`: flex layout for logo and nav.
- `.site-nav`: wrapped flex nav links.
- `.app-shell`: dynamic page area.
- `.hero`: grid layout.
- `.browse-layout`: grid wrapper for filters and results.
- `.game-grid`: responsive grid for deal cards.
- `.platform-grid`, `.category-grid`, `.detail-stats`: responsive grids.
- `.button-row`, `.hero-actions`, `.card-actions`, `.tag-list`: flex layouts.

### Galaxy Background and Glassmorphism

The galaxy background comes from:

```css
background: var(--bg) url("../assets/blue-galaxy-wallpaper.webp") center / cover fixed no-repeat;
```

The glassmorphism style is shared across `.hero`, `.panel`, `.game-card`, `.detail-hero`, `.state-box`, `.category-section`, `.platform-card`, `.category-card`, and `.empty-favorites`.

Those elements use:

- Transparent dark backgrounds.
- Cyan borders.
- Large shadow.
- Cyan glow.
- `backdrop-filter: blur(18px)`.

### Card and Grid Styling

Game card classes:

- `.game-card`: outer card with glass background, border, hover lift, and overflow hidden.
- `.game-card__image`: 16:9 image area with `object-fit: cover`.
- `.game-card__body`: grid body with title, description, tags, and actions.
- `.tag-list`: wrapped list of price/store/platform tags.
- `.tag`: pill-shaped metadata label.
- `.card-actions`: Details and Remove buttons.

Free deal classes:

- `.free-badge`: shared free badge style.
- `.card-free-badge`: absolutely positioned badge on cards.
- `.detail-free-badge`: free badge in details title area.
- `.free-price-tag`: tag style for `FREE` price.

### Detail Page Styling

Details classes:

- `.detail-hero`: main image/content panel.
- `.detail-image-frame`: artwork container.
- `.detail-image`: image uses `object-fit: contain`.
- `.detail-content`: text and buttons.
- `.detail-stats`: stat card grid.
- `.stat-card`: individual deal intelligence/stat card.
- `.comparison-list`: list of other current deals.
- `.comparison-card`: row/card for another deal.

### Responsive Breakpoints

Breakpoints:

- `@media (max-width: 600px)`: smaller container width, smaller padding, smaller main headings, full-width buttons.
- `@media (min-width: 640px)`: header becomes horizontal, grids become two columns, filter controls become two columns.
- `@media (min-width: 900px)`: hero becomes two columns, Browse filter controls become one wide row, Details becomes image plus content columns, comparison cards become row-like.
- `@media (min-width: 1024px)`: game and category grids become three columns, detail stats become four columns.

### Image Handling

CSS handles image layout with:

- `.hero-image`: `aspect-ratio: 4 / 3` and `object-fit: cover`.
- `.game-card__image`: `aspect-ratio: 16 / 9`, max height, and `object-fit: cover`.
- `.detail-image`: full width/height with `object-fit: contain`.

JavaScript adds fallback behavior with `onerror` attributes, usually falling back to `./assets/placeholder.png`.

## `js/api.js`

### Responsibility

`api.js` owns all CheapShark API logic and data preparation. It:

- Builds request URLs.
- Calls `fetch`.
- Handles HTTP errors.
- Loads store names.
- Maps CheapShark deal objects into GameVault UI objects.
- Filters invalid non-deals.
- Deduplicates duplicate deals.
- Creates image URLs, redirect URLs, Steam URLs, and Metacritic URLs.

### Module State and Constants

- `API_BASE_URL`: CheapShark API root.
- `DEALS_PAGE_SIZE`: set to `60`, so list requests ask for 60 deals.
- `DEFAULT_STORE_NAMES`: fallback map for common store IDs.
- `storeNames`: module-level cache, initialized from `DEFAULT_STORE_NAMES` and updated by `fetchStores()`.

### `request(path)`

Input:

- `path`: an API path such as `/deals?pageSize=60`.

Output:

- Parsed JSON data from CheapShark.

What it does:

- Builds `requestUrl` from `API_BASE_URL + path`.
- Logs the request URL.
- Calls `fetch(requestUrl)`.
- Throws an error when `response.ok` is false.
- Calls `response.json()`.
- Logs how many items were returned.
- Returns the parsed data.
- Rethrows errors after logging them.

Connections:

- Used by `getGames()`, `getGameDetails()`, and `fetchStores()`.

### `getGames(filters = {})`

Input:

- Optional filter object with `search`, `storeID`, `maxPrice`, and `sortBy`.

Output:

- Array of normalized, valid, deduplicated game deal objects.

What it does:

1. Calls `fetchStores()`.
2. Creates `URLSearchParams`.
3. Always sets `pageSize` to `60`.
4. Adds `title` if `filters.search` exists.
5. Adds `storeID` if selected.
6. Adds `upperPrice` for numeric max prices. It does not send `upperPrice` for `maxPrice === "free"`.
7. Adds `sortBy` if selected.
8. Requests `/deals?...`.
9. Maps raw deals with `mapDealToGame()`.
10. Filters with `isValidDeal()`.
11. Deduplicates with `deduplicateDeals()`.
12. Returns unique valid deals.

Connections:

- Called by `showHome()` and `showBrowse()` in `app.js`.
- Uses `mapDealToGame()`, `isValidDeal()`, and `deduplicateDeals()`.

### `getGameDetails(id)`

Input:

- `id`: CheapShark `dealID` from the route.

Output:

- One normalized detail game object.

What it does:

1. Calls `fetchStores()`.
2. Requests `/deals?id=${id}`.
3. Checks that `deal.gameInfo` exists.
4. Returns `mapDealDetailsToGame(id, deal)`.

Connections:

- Called by `showGameDetails()` in `app.js`.

### `mapDealToGame(deal)`

Input:

- One raw deal object from CheapShark `/deals`.

Output:

- A normalized GameVault card/list object.

Important fields it creates:

- `id`: from `deal.dealID`.
- `gameId`: from `deal.gameID`.
- `title`.
- `image`: best artwork URL from `getBestImageUrl()`.
- `thumbnail`.
- `fallbackImage`.
- `short_description`: from `createDealSummary()`.
- `game_url`: CheapShark redirect URL.
- `genre` and `storeName`: store name from store ID.
- `platform`: fixed text `"PC deal"`.
- `release_date`: formatted release date.
- `description`: generated deal sentence.
- `salePrice`, `salePriceValue`.
- `normalPrice`, `normalPriceValue`.
- `savings`.
- `dealRating`.
- `storeID`.

### `isValidDeal(deal)`

Input:

- A normalized or partial deal object with sale price, retail/normal price, and savings.

Output:

- Boolean.

What it validates:

- Sale price is finite.
- Retail price is finite.
- Savings is finite.
- Retail price is greater than zero.
- Sale price is lower than retail price.
- Savings is greater than zero.

This is the main invalid non-deal filter.

### `deduplicateDeals(deals)`

Input:

- Array of valid normalized deals.

Output:

- Array with one best deal per game.

What it does:

- Creates a `Map`.
- For every deal, gets a key with `getDealKey()`.
- If the key does not exist, saves the deal.
- If the key exists, keeps the better deal based on `isBetterDeal()`.
- Returns `Array.from(bestDeals.values())`.

### `getDealKey(deal)`

Input:

- Deal object.

Output:

- String key.

What it does:

- Uses `gameID` or `gameId` when available.
- Otherwise falls back to `normalizeTitle(deal.title)`.

### `normalizeTitle(title)`

Input:

- Title string.

Output:

- Lowercase trimmed title with repeated spaces collapsed.

Used only as a fallback duplicate key.

### `isBetterDeal(newDeal, savedDeal)`

Input:

- Two deal objects for the same game.

Output:

- Boolean: true if `newDeal` should replace `savedDeal`.

Decision:

- Prefer higher savings when both savings values are finite and different.
- If savings are tied or not useful, prefer lower sale price.

### `mapDealDetailsToGame(id, deal)`

Input:

- `id`: deal ID from the route.
- `deal`: raw CheapShark detail response.

Output:

- Normalized details object for `renderGameDetails()`.

Important fields:

- `id`
- `title`
- `image`
- `thumbnail`
- `fallbackImage`
- `short_description`
- `game_url` and `dealUrl`
- `storeName` and `storeId`
- `publisher`
- `releaseDate`
- `description`
- `salePrice`, `normalPrice`, `retailPrice`
- `savings`
- `isValidDeal`
- `dealRating`
- `steamRatingText`, `steamRatingPercent`, `steamRatingCount`
- `metacriticScore`, `metacriticLink`
- `steamAppId`, `steamUrl`
- `cheaperStores`
- `cheapestHistoricalPrice`
- `cheapestHistoricalDate`

### `fetchStores()`

Input:

- None.

Output:

- No direct return value used.

What it does:

- Avoids refetching if `storeNames` appears already expanded beyond default names.
- Requests `/stores`.
- For active stores, saves `store.storeID -> store.storeName` in `storeNames`.
- If stores fail, logs a warning and keeps default store names.

Connections:

- Called by `getGames()` and `getGameDetails()`.

### `mapCheaperStores(stores)`

Input:

- `cheaperStores` array from CheapShark details.

Output:

- Array of normalized cheaper-store deal objects.

Each object includes:

- `storeId`
- `storeName`
- `salePrice`
- `salePriceValue`
- `retailPrice`
- `retailPriceValue`
- `savings`
- `dealId`
- `dealUrl`

### `createDealSummary(salePrice, retailPrice, savings)`

Input:

- Sale price, retail price, and savings.

Output:

- Short text summary for cards/details.

Behavior:

- If valid and sale price is `0`, returns a FREE summary.
- If valid and not free, returns sale price, retail price, and savings.
- If not valid but sale price exists, returns current price text.
- Otherwise returns a generic CheapShark details message.

### `createDealOverview(details)`

Input:

- Object containing title, prices, savings, deal rating, Steam rating, and Metacritic score.

Output:

- Longer paragraph for Details view.

It builds sentences only for values that exist.

### Utility Functions in `api.js`

- `formatUnixDate(timestamp)`: converts Unix seconds to `YYYY-MM-DD`, otherwise `"Unknown"`.
- `getStoreName(storeID)`: returns store name from `storeNames` or `Store #id`.
- `getBestImageUrl(gameData)`: chooses Steam header image, upgrades small Steam capsule URLs, or falls back to thumbnail/placeholder.
- `isSteamImageUrl(imageUrl)`: checks whether a URL is a small Steam capsule image.
- `calculateSavings(salePrice, retailPrice)`: calculates rounded savings percentage.
- `normalizePrice(price)`: converts a price to a finite number or `null`.
- `formatPriceText(price)`: returns `"FREE"` for zero or `$price`.
- `hasPriceValue(value)`: checks if a numeric price-like value exists.
- `cleanValue(value)`: turns empty, `0`, or `N/A`-style values into `""`.
- `hasValue(value)`: true when `cleanValue(value)` is not empty.
- `createDealUrl(dealId)`: creates CheapShark redirect URL.
- `createSteamUrl(steamAppId)`: creates Steam store URL when app ID exists.
- `createMetacriticUrl(path)`: turns a Metacritic path into a full URL.

## `js/app.js`

### Responsibility

`app.js` is the application controller. It connects:

- Router.
- API.
- Render functions.
- LocalStorage favorites.
- Browse form events.
- Category button events.
- Favorite button events.

It does not directly build most HTML. That is handled by `render.js`.

### Imports

From `api.js`:

- `getGameDetails`
- `getGames`
- `isValidDeal`

From `storage.js`:

- `addFavorite`
- `getFavorites`
- `isFavorite`
- `removeFavorite`

From `render.js`:

- `renderBrowse`
- `renderCategories`
- `renderError`
- `renderFavorites`
- `renderGameDetails`
- `renderHome`
- `renderLoading`

From `router.js`:

- `getRoute`
- `setActiveNav`
- `startRouter`

### Startup

```js
const app = document.querySelector("#app");
startRouter(renderCurrentRoute);
```

`app` stores the main DOM container. `startRouter()` starts route handling and calls `renderCurrentRoute()` when needed.

### `renderCurrentRoute()`

Input:

- None directly. It reads the current route from `getRoute()`.

Output:

- Renders the correct view.

What it does:

- Reads `{ page, id, query }`.
- Updates nav active state with `setActiveNav(route.page)`.
- Focuses `app`.
- Calls the correct view function:
  - `showHome()`
  - `showBrowse(route.query)`
  - `showCategories()`
  - `showFavorites()`
  - `showGameDetails(route.id)`
- Redirects unknown routes to `#/home`.

### `showHome()`

Input:

- None.

Output:

- Renders Home.

Flow:

- Shows loading.
- Awaits `getGames()`.
- Sends first six games to `renderHome()`.
- Sends favorites count and total unique deal count.
- Renders error on failure.

### `showBrowse(query)`

Input:

- `query`: `URLSearchParams` from the hash route.

Output:

- Renders Browse.

Flow:

- Builds a `filters` object.
- Shows loading.
- Awaits `getGames(filters)`.
- Applies extra client-side filters with `applyBrowseFilters()`.
- Calls `renderBrowse()`.
- If no visible games exist, calls `renderEmptyInsideResults()`.
- Calls `connectBrowseControls()` so the form works.
- Renders error on failure.

### `showCategories()`

Input:

- None.

Output:

- Renders Categories and connects category buttons.

Flow:

- Calls `renderCategories(app)`.
- Selects `[data-browse-query]` buttons.
- Adds click listeners that set `window.location.hash` to `#/browse?...`.

### `showFavorites()`

Input:

- None.

Output:

- Renders Favorites.

Flow:

- Calls `renderFavorites(app, getFavorites())`.
- Selects `[data-remove-favorite]` buttons.
- Adds click listeners that call `removeFavorite()` and then rerender Favorites.

### `showGameDetails(gameId)`

Input:

- `gameId`: actually the CheapShark deal ID from the route.

Output:

- Renders Details.

Flow:

- Shows loading.
- Awaits `getGameDetails(gameId)`.
- Calls `renderGameDetails(app, game, isFavorite(game.id))`.
- Calls `connectFavoriteButton(game)`.
- Renders error on failure.

### `connectBrowseControls()`

Input:

- None directly. It reads DOM elements after Browse is rendered.

Output:

- Adds event listeners to the filter form and clear button.

Flow:

- Selects `#filter-form` and `#clear-filters`.
- On form submit:
  - Prevents default reload.
  - Uses `FormData`.
  - Creates `URLSearchParams`.
  - Adds non-empty values only.
  - Changes hash to `#/browse?...` or `#/browse`.
- On clear:
  - Changes hash to `#/browse`.

### `connectFavoriteButton(game)`

Input:

- Full details game object.

Output:

- Adds click behavior to the Details favorite button.

Flow:

- Selects `[data-favorite-id]`.
- If button does not exist, returns.
- On click:
  - If already favorite, calls `removeFavorite(game.id)`.
  - Otherwise calls `addFavorite(createFavoriteSummary(game))`.
  - Rerenders Details with the new favorite state.
  - Reconnects the button because rerendering replaced the old DOM.

### `applyBrowseFilters(games, filters)`

Input:

- Array of games.
- Filters object.

Output:

- Filtered array.

It applies:

1. `filterGamesBySearch(games, filters.search)`.
2. `filterGamesByMaxPrice(..., filters.maxPrice)`.

### `filterGamesBySearch(games, searchTerm)`

Input:

- Games array.
- Search string.

Output:

- Same array if search is empty, otherwise games whose titles include the normalized search term.

The comparison is case-insensitive.

### `filterGamesByMaxPrice(games, maxPrice)`

Input:

- Games array.
- Max price value.

Output:

- Same array unless `maxPrice === "free"`.

For `free`, it keeps only games where:

- sale price is a finite number,
- sale price is exactly `0`,
- `isValidDeal(game)` is true.

Numeric max prices are mostly handled by CheapShark through `upperPrice` in `getGames()`.

### `renderEmptyInsideResults()`

Input:

- None directly.

Output:

- Replaces Browse result grid with a no-results state.

It selects `[aria-label='Deal results']`, then `.game-grid`, and writes a `.state-box` message into that grid.

### `createFavoriteSummary(game)`

Input:

- Details game object.

Output:

- Smaller object saved to LocalStorage.

Saved fields:

- `id`
- `title`
- `thumbnail`
- `short_description`
- `genre`
- `platform`
- `salePrice`
- `salePriceValue`
- `normalPrice`
- `normalPriceValue`
- `savings`

### `createApiErrorMessage(error)`

Input:

- Error object.

Output:

- User-facing error string that includes `error.message` and tells the user to check the console.

## `js/router.js`

### Responsibility

`router.js` implements simple hash-based routing. It does not use the server. Every route is stored after `#` in the URL.

### `getRoute()`

Input:

- None. Reads `window.location.hash`.

Output:

- Object with:

```js
{ page, id, query }
```

What it does:

- Defaults to `#/home`.
- Removes the leading `#`.
- Splits path and query string at `?`.
- Splits path by `/`.
- Uses the first path part as `page`.
- Uses the second path part as decoded `id`.
- Converts the query string into `URLSearchParams`.

### `setActiveNav(page)`

Input:

- Current page string.

Output:

- Updates nav link classes in the DOM.

What it does:

- Selects all `[data-nav-link]`.
- Reads each link's `href`, removes `#/`, and compares it to `page`.
- Toggles `.active` when the link matches the current page.

### `startRouter(renderCurrentRoute)`

Input:

- Callback function from `app.js`.

Output:

- Starts route handling.

What it does:

- Adds a `hashchange` listener.
- If there is no hash, sets `window.location.hash = "#/home"` and returns.
- Otherwise calls `renderCurrentRoute()` immediately.

## `js/render.js`

### Responsibility

`render.js` creates all view markup. It receives data and writes HTML strings into the `app` element. It also contains helper functions for card HTML, stats, tags, price formatting, free deal detection, and display filtering.

It does not fetch data and does not read LocalStorage directly.

### Exported Data

#### `stores`

Array used to build the Browse store filter:

- All stores
- Steam
- GOG
- Humble Store
- Fanatical
- Epic Games Store
- GameBillet
- IndieGala

Each item has:

- `value`
- `label`

#### `sortOptions`

Array used to build the Browse sort select:

- Deal rating
- Biggest savings
- Lowest price
- Title
- Metacritic score
- Release date
- Steam reviews

Each item has:

- `value`
- `label`

### Internal Data

#### `dealCollections`

Array used by Categories to create deal collection buttons. Each item has:

- `title`
- `label`
- `description`
- `query`

Examples:

- Best Rated Deals: `sortBy=Deal%20Rating`
- Biggest Savings: `sortBy=Savings`
- Under $5: `maxPrice=5&sortBy=Price`
- Steam Deals: `storeID=1`

### `renderLoading(app, message = "Loading deals...")`

Input:

- `app`: main container.
- `message`: loading message.

Output:

- Writes a loading state into `app.innerHTML`.

Uses `.state-box`, `.loader`, `.spinner`, and `aria-live="polite"`.

### `renderError(app, message)`

Input:

- `app`: main container.
- `message`: error text.

Output:

- Writes an error state into `app.innerHTML`.

Uses `aria-live="assertive"`.

### `renderHome(app, featuredGames, favoritesCount, totalGames = featuredGames.length)`

Input:

- Main container.
- Array of featured games.
- Favorite count.
- Total unique game count.

Output:

- Home view markup.

It creates cards with `createGameCard(game)` and includes:

- Hero.
- Browse/Favorites buttons.
- Cat hero image.
- Featured Deals title.
- Featured game grid.

### `renderBrowse(app, games, filters)`

Input:

- Main container.
- Games array.
- Current filter object.

Output:

- Browse view markup.

It creates:

- Store options from `stores`.
- Sort options from `sortOptions`.
- Cards with `createGameCard(game)`.
- Filter form with `#filter-form`.
- Results header.
- `.game-grid` of cards.

### `renderCategories(app)`

Input:

- Main container.

Output:

- Categories view markup.

It renders:

- Store links using `.platform-card`.
- Deal collection buttons using `.category-button` and `data-browse-query`.

The click behavior for collection buttons is added later in `showCategories()`.

### `renderFavorites(app, favorites)`

Input:

- Main container.
- Favorites array from LocalStorage.

Output:

- Favorites view markup.

Behavior:

- If no favorites exist, renders `.empty-favorites`.
- If favorites exist, renders a `.game-grid`.
- It calls `createGameCard(game, true)`, which adds Remove buttons.

The remove button behavior is added later in `showFavorites()`.

### `renderGameDetails(app, game, favorite)`

Input:

- Main container.
- Full details game object.
- Boolean favorite state.

Output:

- Details view markup.

Behavior:

- If `game.isValidDeal === false`, calls `renderExpiredDeal(app)` and returns.
- Builds stats with `createDetailStats(game)`.
- Builds other current deals with `createOtherDealsMarkup(game.cheaperStores || [])`.
- Shows free badge if `isFreeDeal(game)` is true.
- Renders artwork, title, buttons, stat cards, overview, and comparison list.

### `renderExpiredDeal(app)`

Input:

- Main container.

Output:

- Expired/invalid detail state.

This is used when CheapShark details say the deal is no longer a valid discount.

### `createGameCard(game, showRemoveButton = false)`

Input:

- Game object.
- Boolean controlling whether to show Remove button.

Output:

- HTML string for one game card.

It includes:

- Optional free badge.
- Image with fallback.
- Title.
- Description.
- Price/store/platform tags.
- Details link.
- Optional Remove button with `data-remove-favorite`.

### `optionTemplate(value, label, selectedValue)`

Input:

- Option value.
- Option label.
- Current selected value.

Output:

- HTML `<option>` string.

It marks the option as `selected` when `value === selectedValue`.

### `createPriceTags(game)`

Input:

- Game object.

Output:

- HTML string of price-related `<li>` tags.

Behavior:

- Returns empty string if price values are missing.
- Returns empty string if the game is not discounted.
- Shows `FREE` for free deals.
- Shows sale price, normal price, and savings percentage for valid discounts.

### `createDetailStats(game)`

Input:

- Details game object.

Output:

- HTML string of stat cards.

Stats it tries to create:

- Sale price.
- Retail price.
- Savings.
- Store.
- Deal rating.
- Steam rating.
- Metacritic.
- Historical low.

It filters out empty stat cards. If no stats are visible, it returns a fallback "Details Not provided" stat card.

### `createStatCard(label, value, subtext = "")`

Input:

- Stat label.
- Main value.
- Optional subtext.

Output:

- HTML string for one `.stat-card`, or `""` if value should not be displayed.

### `createOtherDealsMarkup(deals)`

Input:

- Array of normalized cheaper store deals.

Output:

- HTML string.

Behavior:

- Filters to valid discounted deals with `isDiscountedDeal`.
- If no valid deals remain, returns `.muted-note`.
- Otherwise returns `.comparison-list` containing `.comparison-card` rows.

### `createSteamRatingSubtext(game)`

Input:

- Details game object.

Output:

- Text like `85% positive from 1,234 reviews`.

It only includes values that exist.

### Formatting and Validation Helpers in `render.js`

- `formatMoney(value)`: returns `"FREE"`, `$value`, or `""`.
- `formatDealPriceLine(deal)`: returns sale/retail comparison text.
- `formatPercent(value)`: returns `value%` or `""`.
- `formatDateText(value)`: returns `Recorded on YYYY-MM-DD` or `""`.
- `hasDisplayValue(value)`: checks whether a general display value is meaningful.
- `hasPriceValue(value)`: checks whether a value is a valid numeric price.
- `isFreeDeal(deal)`: true when sale price is `0`, retail price is greater than `0`, and savings is greater than `0`.
- `isDiscountedDeal(deal)`: true when sale price is lower than retail price and savings is greater than `0`.
- `formatText(text)`: capitalizes words split by hyphens.

## `js/storage.js`

### Responsibility

`storage.js` owns favorites persistence with LocalStorage.

It does not render UI and does not call the API.

### `FAVORITES_KEY`

The LocalStorage key:

```js
const FAVORITES_KEY = "gamevault-favorites";
```

### `getFavorites()`

Input:

- None.

Output:

- Array of favorite game summaries.

Behavior:

- Reads LocalStorage with `localStorage.getItem(FAVORITES_KEY)`.
- If nothing is saved, returns `[]`.
- Tries to parse JSON.
- If JSON parsing fails, returns `[]`.

### `saveFavorites(favorites)`

Input:

- Favorites array.

Output:

- Writes to LocalStorage.

It uses:

```js
localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
```

### `isFavorite(gameId)`

Input:

- Game/deal ID.

Output:

- Boolean.

It reads favorites and checks if any favorite has the same ID. It converts both IDs to strings so number/string differences do not break lookup.

### `addFavorite(game)`

Input:

- Favorite summary object.

Output:

- Saves the updated favorites array if the game is not already saved.

Behavior:

- Reads current favorites.
- Checks if the exact `id` already exists.
- Pushes the game if not already saved.
- Calls `saveFavorites(favorites)`.

### `removeFavorite(gameId)`

Input:

- Game/deal ID.

Output:

- Saves a new favorites array without that ID.

It also compares IDs as strings.

## `README.md`

### Responsibility

The README explains the project for humans. It includes:

- Project name and student name.
- Short project description.
- Technologies used.
- Feature list.
- API endpoints.
- How to run locally.
- Project structure.
- File responsibilities.
- Credits.
- Submission checklist.

### Note

The README says the assets include `favicon.svg` and `placeholder.svg`, but the actual project files are `favicon.png` and `placeholder.png`. The running site uses the PNG files correctly.

## `assets` Folder

### Responsibility

The `assets` folder stores local images used by the HTML, CSS, and rendering templates.

Current files:

- `blue-galaxy-wallpaper.webp`: page background used by `body` in `style.css`.
- `cat.jpg`: Home hero image.
- `favicon.png`: browser tab icon linked from `index.html`.
- `placeholder.png`: fallback image used when API artwork fails.

## How Files Connect

High-level dependency flow:

```text
index.html
  loads css/style.css
  loads js/app.js as an ES module

app.js
  imports api.js
  imports storage.js
  imports render.js
  imports router.js

router.js
  reads window.location.hash
  tells app.js what page/id/query is active

api.js
  calls CheapShark with fetch
  returns normalized deal objects

storage.js
  reads/writes favorites in LocalStorage

render.js
  receives data from app.js
  writes view markup into #app
```

## Potential Weak Spots

- `render.js` writes API values and route/search values with `innerHTML`. This is simple and common in school vanilla projects, but production code should escape text or use DOM node creation to reduce XSS risk.
- `connectBrowseControls()` and `renderEmptyInsideResults()` depend on expected DOM elements already existing.
- The project has no automated tests.
- README asset names are slightly outdated for `favicon` and `placeholder`.
- LocalStorage favorites are browser-only and can be cleared by the user.
- Live API dependency means the site depends on CheapShark availability and network access.
