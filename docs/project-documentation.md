# GameVault Project Documentation

## Project Overview

GameVault is a responsive vanilla HTML, CSS, and JavaScript website for discovering discounted PC game deals. It uses live deal data from the CheapShark API and presents it through several single-page-app style views: Home, Browse, Categories, Favorites, and Details.

The project does not use React, frameworks, Bootstrap, Tailwind, jQuery, npm packages, a backend, or build tools. The whole application runs in the browser from static files.

## Purpose of GameVault

The purpose of GameVault is to help users find real PC game discounts quickly. Instead of showing every game, the project focuses on active discounted deals:

- It loads current deals from CheapShark.
- It filters out invalid non-deals where the sale price is not actually lower than the retail price.
- It removes duplicate deals for the same game.
- It lets the user search, filter, sort, open a details page, and save favorite deals in the browser.

For the exam, the key idea is: GameVault is not a general game database. It is a live game deals discovery website.

## Technologies Used

- `index.html`: semantic HTML page shell.
- `css/style.css`: custom responsive CSS using variables, Flexbox, Grid, media queries, glass panels, and the galaxy background.
- `js/app.js`: main controller that connects routing, API calls, rendering, filters, and favorites.
- `js/api.js`: CheapShark API requests, response mapping, validation, deduplication, and detail normalization.
- `js/router.js`: hash-based routing.
- `js/render.js`: dynamic DOM rendering with template strings.
- `js/storage.js`: LocalStorage favorites.
- Browser APIs: `fetch`, `async/await`, `URLSearchParams`, `FormData`, `localStorage`, `window.location.hash`, DOM selectors, and event listeners.

## Why CheapShark API Was Used

CheapShark was a good API choice because:

- It provides real PC game deal data.
- It has public browser-friendly endpoints.
- It does not require a backend server for this project.
- It supports useful query parameters such as title search, store filtering, price filtering, and sorting.
- It provides both deal list data and individual deal details.
- It fits the project goal: a game deals discovery website.

The API base URL is stored in `js/api.js` as:

```js
const API_BASE_URL = "https://www.cheapshark.com/api/1.0";
```

The project uses these CheapShark endpoints:

- `/stores`: refreshes store names.
- `/deals`: loads deal lists.
- `/deals?id={dealID}`: loads one deal's details.

## Main Features

- Home view with a hero section and featured deals.
- Browse view with search, store filter, maximum price filter, and sort options.
- Categories view with store cards and deal collection cards.
- Favorites view saved in LocalStorage.
- Details view with sale price, retail price, savings, ratings, historical low, related cheaper deals, and favorite button.
- CheapShark API integration using `fetch` and `async/await`.
- Dynamic DOM rendering through JavaScript template strings.
- Filtering out invalid 0 percent discount non-deals.
- Deduplication so the same game does not appear repeatedly.
- Free deal highlighting with `.free-badge` and `.free-price-tag`.
- Loading, error, empty, and expired-deal states.
- Responsive dark galaxy/glassmorphism design.

## Page and View Breakdown

### Home

The Home view is selected by the `#/home` hash route.

Flow:

1. `renderCurrentRoute()` in `js/app.js` reads the current route.
2. If `route.page === "home"`, it calls `showHome()`.
3. `showHome()` calls `renderLoading(app, "Loading featured deals...")`.
4. It awaits `getGames()`.
5. It calls `renderHome(app, games.slice(0, 6), getFavorites().length, games.length)`.

What the Home view shows:

- Hero title: `GameVault`.
- Hero text explaining deal discovery.
- Buttons for Browse and Favorites.
- The number of saved favorites.
- Six featured deal cards from the first six unique valid API results.
- Hero image from `./assets/cat.jpg`.

Important classes:

- `.hero`
- `.hero-content`
- `.hero-actions`
- `.hero-image-frame`
- `.hero-image`
- `.featured-page-title`
- `.game-grid`
- `.game-card`

### Browse

The Browse view is selected by `#/browse`, optionally with query parameters such as:

```text
#/browse?search=doom&storeID=1&maxPrice=10&sortBy=Price
```

Flow:

1. `renderCurrentRoute()` calls `showBrowse(route.query)`.
2. `showBrowse()` reads filters from `URLSearchParams`.
3. It calls `renderLoading(app, "Loading deals...")`.
4. It awaits `getGames(filters)`.
5. It applies extra client-side filters with `applyBrowseFilters(games, filters)`.
6. It renders the Browse page with `renderBrowse(app, visibleGames, filters)`.
7. It connects the filter form with `connectBrowseControls()`.

Browse filters:

- `search`: title search.
- `storeID`: CheapShark store ID.
- `maxPrice`: empty, `free`, `5`, `10`, or `20`.
- `sortBy`: CheapShark sort option.

Important detail: numeric max price options like `5`, `10`, and `20` are sent to CheapShark as `upperPrice` in `getGames()`. The `free` option is handled client-side in `filterGamesByMaxPrice()` because it specifically checks for `salePrice === 0` and confirms the game is still a valid discounted deal.

Important classes and IDs:

- `.browse-layout`
- `.browse-filter-panel`
- `.control-grid`
- `.field`
- `#filter-form`
- `#clear-filters`
- `#search`
- `#store`
- `#max-price`
- `#sort-by`
- `.results-header`
- `.game-grid`

### Categories

The Categories view is selected by `#/categories`.

Flow:

1. `renderCurrentRoute()` calls `showCategories()`.
2. `showCategories()` calls `renderCategories(app)`.
3. It finds buttons with `[data-browse-query]`.
4. Each button gets a click listener that changes the hash to a filtered Browse route.

Categories contains two types of shortcuts:

- Store cards: Steam, GOG, Epic Games Store.
- Deal collection buttons from the `dealCollections` array in `js/render.js`.

Examples:

- Steam card links to `#/browse?storeID=1`.
- Under $5 collection uses `maxPrice=5&sortBy=Price`.
- Biggest Savings uses `sortBy=Savings`.

Important classes:

- `.category-section`
- `.section-heading`
- `.platform-grid`
- `.platform-card`
- `.category-grid`
- `.category-card`
- `.category-button`
- `.category-card__label`

### Favorites

The Favorites view is selected by `#/favorites`.

Flow:

1. `renderCurrentRoute()` calls `showFavorites()`.
2. `showFavorites()` reads saved deals with `getFavorites()`.
3. It calls `renderFavorites(app, getFavorites())`.
4. If favorites exist, it attaches click listeners to `[data-remove-favorite]` buttons.
5. Removing a favorite calls `removeFavorite(id)` and then rerenders Favorites.

Favorites are not stored on a server. They are stored in the browser's LocalStorage under the key:

```js
const FAVORITES_KEY = "gamevault-favorites";
```

When there are no favorites, `renderFavorites()` displays the `.empty-favorites` state.

Important classes:

- `.empty-favorites`
- `.empty-favorites__content`
- `.empty-favorites__eyebrow`
- `.game-grid`
- `.small-button.danger`

### Details

The Details view is selected by `#/game/{dealID}`.

Flow:

1. A deal card has a link like `#/game/${encodeURIComponent(game.id)}`.
2. `getRoute()` parses the hash and returns `{ page: "game", id, query }`.
3. `renderCurrentRoute()` calls `showGameDetails(route.id)`.
4. `showGameDetails()` calls `renderLoading(app, "Loading deal details...")`.
5. It awaits `getGameDetails(gameId)`.
6. It calls `renderGameDetails(app, game, isFavorite(game.id))`.
7. It connects the Save/Remove Favorite button with `connectFavoriteButton(game)`.

Details view content:

- Large artwork.
- Deal title.
- Free badge when relevant.
- Short deal summary.
- Buttons for View Deal, Save/Remove Favorite, Steam Page, Metacritic, and Back to Browse.
- Detail stat cards.
- Deal Overview text.
- Other current deals from `cheaperStores`.

Important classes:

- `.detail-hero`
- `.detail-image-frame`
- `.detail-image`
- `.detail-content`
- `.detail-stats`
- `.stat-card`
- `.comparison-list`
- `.comparison-card`
- `.detail-free-badge`

## Data Flow

### 1. User Opens the Site

The browser loads `index.html`, which includes:

- Header navigation.
- `<main id="app" class="app-shell" tabindex="-1"></main>`.
- Footer crediting CheapShark.
- ES module script:

```html
<script type="module" src="./js/app.js"></script>
```

Because `app.js` is loaded as a module, it can use `import` statements to load the other JavaScript files.

### 2. Router Chooses the View

`app.js` calls:

```js
startRouter(renderCurrentRoute);
```

`startRouter()` in `js/router.js`:

- Listens for `hashchange`.
- Sends users without a hash to `#/home`.
- Calls `renderCurrentRoute()` for the current route.

`getRoute()` reads `window.location.hash` and returns:

```js
{ page, id, query }
```

Examples:

- `#/home` becomes `{ page: "home", id: "", query: URLSearchParams }`.
- `#/browse?storeID=1` becomes `{ page: "browse", id: "", query }`.
- `#/game/abc123` becomes `{ page: "game", id: "abc123", query }`.

### 3. API Fetch Happens

For Home and Browse, `app.js` calls `getGames(filters)`.

For Details, `app.js` calls `getGameDetails(id)`.

Both functions call `fetchStores()` first so store IDs can be displayed as store names.

The shared `request(path)` helper:

- Builds the full CheapShark URL.
- Calls `fetch(requestUrl)`.
- Checks `response.ok`.
- Converts the response with `response.json()`.
- Logs useful debugging information.
- Throws errors so `app.js` can render an error state.

### 4. Data Is Normalized

CheapShark data does not exactly match the shape needed by the UI, so `api.js` maps it into consistent GameVault objects.

For list results:

```js
const normalizedDeals = deals.map(mapDealToGame);
```

For details:

```js
return mapDealDetailsToGame(id, deal);
```

The normalized object includes fields such as:

- `id`
- `gameId`
- `title`
- `image`
- `thumbnail`
- `fallbackImage`
- `short_description`
- `game_url`
- `storeName`
- `storeId`
- `platform`
- `salePrice`
- `salePriceValue`
- `normalPrice`
- `normalPriceValue`
- `retailPrice`
- `retailPriceValue`
- `savings`
- `dealRating`
- `isValidDeal`

The render layer can then use one predictable object shape.

### 5. Invalid Deals Are Filtered

`isValidDeal(deal)` checks that:

- Sale price is a real number.
- Retail price is a real number.
- Savings is a real number.
- Retail price is greater than zero.
- Sale price is lower than retail price.
- Savings is greater than zero.

That means a deal with a 0 percent discount is not shown as a valid deal.

Important: free games can still be valid deals, but only when the retail price is greater than zero and savings is greater than zero. A free listing with no real retail discount is not treated as a valid deal.

### 6. Duplicates Are Removed

`deduplicateDeals(deals)` removes duplicates by keeping the best deal for each game.

It uses:

- `getDealKey(deal)` to group deals by `gameID` / `gameId`, or normalized title if no game ID exists.
- `isBetterDeal(newDeal, savedDeal)` to keep the deal with higher savings, or lower price if savings are tied.

This prevents Browse and Home from showing many duplicate cards for the same game.

### 7. DOM Is Rendered

Rendering is done in `js/render.js` by replacing `app.innerHTML`.

Main render functions:

- `renderLoading()`
- `renderError()`
- `renderHome()`
- `renderBrowse()`
- `renderCategories()`
- `renderFavorites()`
- `renderGameDetails()`
- `createGameCard()`

After rendering, `app.js` attaches event listeners where needed, because replacing `innerHTML` removes previous DOM nodes and their listeners.

### 8. User Interacts

The user can:

- Change filters in Browse.
- Submit the filter form.
- Clear filters.
- Click category shortcuts.
- Open a Details page.
- Save or remove a favorite.
- Remove favorites from the Favorites view.
- Open external CheapShark, Steam, or Metacritic links.

Most navigation happens by changing `window.location.hash`, which triggers the router.

## State Management Explanation

GameVault uses simple browser state instead of a framework state library.

The main state sources are:

- URL hash route: current page and detail ID.
- URL query string inside the hash: Browse filters.
- LocalStorage: saved favorites.
- DOM: current rendered view.
- `storeNames` module variable in `api.js`: cached store names after `/stores` is fetched.

There is no global app object, Redux store, class-based controller, or backend session. The route decides what to render, and each render gets fresh data from the API or LocalStorage.

## LocalStorage Explanation

Favorites are stored in `js/storage.js`.

Key:

```js
const FAVORITES_KEY = "gamevault-favorites";
```

Functions:

- `getFavorites()`: reads and parses the favorites array. If nothing is saved or JSON parsing fails, it returns `[]`.
- `saveFavorites(favorites)`: stringifies the array and writes it to LocalStorage.
- `isFavorite(gameId)`: checks if a game ID already exists in favorites.
- `addFavorite(game)`: gets the current array, avoids duplicates, pushes the new favorite, and saves.
- `removeFavorite(gameId)`: filters the matching favorite out and saves the new array.

The saved favorite is a summary object from `createFavoriteSummary(game)`, not the full detail object. This keeps stored data smaller.

## Loading, Error, and Empty State Explanation

### Loading

Before async API calls, `app.js` calls `renderLoading()`.

Examples:

- Home: `Loading featured deals...`
- Browse: `Loading deals...`
- Details: `Loading deal details...`

The loading UI uses:

- `.state-box`
- `.loader`
- `.spinner`
- `aria-live="polite"`

### Error

If a fetch or mapping step throws an error, `app.js` catches it and calls:

```js
renderError(app, createApiErrorMessage(error));
```

The error UI uses `aria-live="assertive"` so screen readers are notified more strongly.

### Empty Results

Browse handles no results by:

1. Rendering the normal Browse view with an empty game list.
2. Calling `renderEmptyInsideResults()`.
3. Replacing the `.game-grid` content with a `.state-box`.

Favorites handles no saved deals with a special `.empty-favorites` view.

Details handles expired or invalid details through `renderExpiredDeal(app)` when `game.isValidDeal === false`.

## Responsive Design Explanation

The design uses one stylesheet: `css/style.css`.

Main responsive techniques:

- `width: min(1180px, calc(100% - 32px))` keeps content centered and prevents full-width stretching.
- CSS Grid powers cards, detail stats, categories, and the hero layout.
- Flexbox powers navigation, buttons, tags, and action rows.
- Media queries adjust layouts at `600px`, `640px`, `900px`, and `1024px`.

Breakpoints:

- `max-width: 600px`: smaller horizontal margins, smaller padding, smaller headings, full-width buttons.
- `min-width: 640px`: two-column card/category/stat grids and horizontal header.
- `min-width: 900px`: two-column hero and details layout, wide filter grid, comparison rows.
- `min-width: 1024px`: three-column game/category grids and four-column detail stat grid.

The visual style is a dark blue galaxy/glass design:

- `body` uses `blue-galaxy-wallpaper.webp` as a fixed background.
- `body::before` adds a dark overlay for readability.
- panels use semi-transparent backgrounds, borders, shadows, glow, and `backdrop-filter: blur(18px)`.

## Accessibility Basics

GameVault includes several accessibility-friendly choices:

- Semantic structure: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`, headings, forms, buttons, and links.
- Navigation has `aria-label="Main navigation"`.
- The app container has `tabindex="-1"` so `app.focus()` can move focus to the updated view after route changes.
- Loading and error states use `aria-live`.
- Result sections use labels such as `aria-label="Deal results"`, `aria-label="Featured deals"`, and `aria-label="Favorite deals"`.
- Images have descriptive `alt` text.
- External links include `target="_blank"` with `rel="noopener noreferrer"`.
- Form controls have labels connected by `for` and `id`.
- Keyboard focus is visible with `:focus-visible`.

## Potential Weak Spots

These are not necessarily exam-breaking problems, but they are worth understanding and being ready to explain:

- The render functions use `innerHTML` with API data and the search value. In a production app, user/API text should be escaped or rendered with safer DOM methods to reduce XSS risk.
- `connectBrowseControls()` assumes `#filter-form` and `#clear-filters` exist after `renderBrowse()`. In the current flow they do exist, so it works.
- `renderEmptyInsideResults()` assumes `[aria-label='Deal results']` and `.game-grid` exist. It works because it is only called after `renderBrowse()`.
- There are no automated tests. Manual testing is the current verification method.
- README lists `favicon.svg` and `placeholder.svg`, but the actual assets are `favicon.png` and `placeholder.png`.
- Favorites are stored locally per browser. They do not sync between browsers or devices.
- CheapShark availability controls whether Home, Browse, and Details can load live data.
