export const stores = [
  { value: "", label: "All stores" },
  { value: "1", label: "Steam" },
  { value: "7", label: "GOG" },
  { value: "11", label: "Humble Store" },
  { value: "15", label: "Fanatical" },
  { value: "25", label: "Epic Games Store" },
  { value: "23", label: "GameBillet" },
  { value: "30", label: "IndieGala" }
];

export const sortOptions = [
  { value: "", label: "Deal rating" },
  { value: "Savings", label: "Biggest savings" },
  { value: "Price", label: "Lowest price" },
  { value: "Title", label: "Title" },
  { value: "Metacritic", label: "Metacritic score" },
  { value: "Release", label: "Release date" },
  { value: "Reviews", label: "Steam reviews" }
];

const dealCollections = [
  {
    title: "Best Rated Deals",
    label: "Top picks",
    description: "Browse deals sorted by CheapShark deal rating.",
    query: "sortBy=Deal%20Rating"
  },
  {
    title: "Biggest Savings",
    label: "Discounts",
    description: "Find games with the largest percentage discounts.",
    query: "sortBy=Savings"
  },
  {
    title: "Under $5",
    label: "Budget",
    description: "Look for low-price deals that stay under five dollars.",
    query: "maxPrice=5&sortBy=Price"
  },
  {
    title: "Steam Deals",
    label: "Store",
    description: "Show current deals from Steam.",
    query: "storeID=1"
  },
  {
    title: "GOG Deals",
    label: "Store",
    description: "Show current deals from GOG.",
    query: "storeID=7"
  },
  {
    title: "Epic Deals",
    label: "Store",
    description: "Show current deals from the Epic Games Store.",
    query: "storeID=25"
  }
];

export function renderLoading(app, message = "Loading deals...") {
  app.innerHTML = `
    <section class="state-box" aria-live="polite">
      <div class="loader">
        <span class="spinner" aria-hidden="true"></span>
        <span>${message}</span>
      </div>
    </section>
  `;
}

export function renderError(app, message) {
  app.innerHTML = `
    <section class="state-box" aria-live="assertive">
      <h2>Something went wrong</h2>
      <p>${message}</p>
      <p>Check the browser console for the exact request URL and error.</p>
    </section>
  `;
}

export function renderEmpty(app, message = "No deals matched your search.") {
  app.innerHTML = `
    <section class="state-box">
      <h2>No results</h2>
      <p>${message}</p>
    </section>
  `;
}

export function renderHome(app, featuredGames, favoritesCount, notice = "", dataSource = "live", totalGames = featuredGames.length) {
  const cards = featuredGames.map((game) => createGameCard(game)).join("");
  const featuredText = dataSource === "fallback"
    ? `Temporary development backup is showing ${totalGames} sample deals while the live API is unavailable.`
    : `Showing ${featuredGames.length} featured deals from ${totalGames} unique live CheapShark results.`;

  app.innerHTML = `
    ${createNotice(notice)}

    <section class="hero">
      <div>
        <h1>GameVault</h1>
        <p>Discover live PC game deals, compare discounts, and save your favorite deals.</p>
      </div>
      <div class="hero-actions">
        <a class="button" href="#/browse">Browse Deals</a>
        <a class="button secondary" href="#/favorites">View Favorites (${favoritesCount})</a>
      </div>
    </section>

    <section class="page-title" aria-labelledby="featured-title">
      <h2 id="featured-title">Featured Deals</h2>
      <p>${featuredText}</p>
    </section>

    <section class="game-grid" aria-label="Featured games">
      ${cards}
    </section>
  `;
}

export function renderBrowse(app, games, filters, notice = "", dataSource = "live") {
  const storeOptions = stores
    .map((store) => optionTemplate(store.value, store.label, filters.storeID))
    .join("");
  const sortByOptions = sortOptions
    .map((sortOption) => optionTemplate(sortOption.value, sortOption.label, filters.sortBy))
    .join("");
  const cards = games.map((game) => createGameCard(game)).join("");
  const resultLabel = dataSource === "fallback" ? "backup deals found" : "unique deals found";

  app.innerHTML = `
    ${createNotice(notice)}

    <section class="page-title">
      <h1>Browse Deals</h1>
      <p>Browse discounted games from CheapShark with live search, filters, and sorting.</p>
    </section>

    <section class="layout-grid">
      <aside class="panel" aria-label="Game filters">
        <h2>Filters</h2>
        <form id="filter-form" class="control-grid">
          <div class="field">
            <label for="search">Search by title</label>
            <input id="search" name="search" type="search" value="${filters.search}" placeholder="Example: Warframe">
          </div>

          <div class="field">
            <label for="store">Store</label>
            <select id="store" name="storeID">${storeOptions}</select>
          </div>

          <div class="field">
            <label for="max-price">Maximum price</label>
            <select id="max-price" name="maxPrice">
              <option value="" ${filters.maxPrice === "" ? "selected" : ""}>Any price</option>
              <option value="5" ${filters.maxPrice === "5" ? "selected" : ""}>Under $5</option>
              <option value="10" ${filters.maxPrice === "10" ? "selected" : ""}>Under $10</option>
              <option value="20" ${filters.maxPrice === "20" ? "selected" : ""}>Under $20</option>
            </select>
          </div>

          <div class="field">
            <label for="sort-by">Sort</label>
            <select id="sort-by" name="sortBy">${sortByOptions}</select>
          </div>

          <button class="button" type="submit">Apply</button>
          <button class="button secondary" type="button" id="clear-filters">Clear</button>
        </form>
      </aside>

      <section aria-label="Game results">
        <div class="results-header">
          <strong>${games.length} ${resultLabel}</strong>
          <span>Click a card to see more details.</span>
        </div>
        <div class="game-grid">
          ${cards}
        </div>
      </section>
    </section>
  `;
}

export function renderCategories(app) {
  const collectionCards = dealCollections
    .map((collection) => `
      <article class="category-card">
        <button class="category-button" type="button" data-browse-query="${collection.query}">
          <span class="category-card__label">${collection.label}</span>
          <strong>${collection.title}</strong>
          <span>${collection.description}</span>
        </button>
      </article>
    `)
    .join("");

  app.innerHTML = `
    <section class="page-title">
      <h1>Collections</h1>
      <p>Choose a store or deal collection to jump into a filtered Browse view.</p>
    </section>

    <section class="category-section" aria-labelledby="platform-title">
      <div class="section-heading">
        <h2 id="platform-title">Stores</h2>
        <p>Start with where you want to shop.</p>
      </div>
      <div class="platform-grid" aria-label="Platform links">
        <a class="platform-card" href="#/browse?storeID=1">
          <span>Store</span>
          <strong>Steam</strong>
          <small>Current deals listed for Steam.</small>
        </a>
        <a class="platform-card" href="#/browse?storeID=7">
          <span>Store</span>
          <strong>GOG</strong>
          <small>Current deals listed for GOG.</small>
        </a>
        <a class="platform-card" href="#/browse?storeID=25">
          <span>Store</span>
          <strong>Epic Games Store</strong>
          <small>Current deals listed for Epic.</small>
        </a>
      </div>
    </section>

    <section class="category-section" aria-labelledby="genre-title">
      <div class="section-heading">
        <h2 id="genre-title">Deal Collections</h2>
        <p>Pick a supported CheapShark filter.</p>
      </div>
      <div class="category-grid" aria-label="Deal collections">
        ${collectionCards}
      </div>
    </section>
  `;
}

export function renderFavorites(app, favorites) {
  if (favorites.length === 0) {
    app.innerHTML = `
      <section class="empty-favorites">
        <div class="empty-favorites__content">
          <span class="empty-favorites__eyebrow">Your vault is empty</span>
          <h1>No favorites saved yet</h1>
          <p>Browse deals and open a details page to save discounts you want to remember.</p>
          <a class="button" href="#/browse">Browse Deals</a>
        </div>
      </section>
    `;
    return;
  }

  const cards = favorites.map((game) => createGameCard(game, true)).join("");

  app.innerHTML = `
    <section class="page-title">
      <h1>Favorites</h1>
      <p>Your saved deals are stored in this browser with LocalStorage.</p>
    </section>

    <section class="game-grid" aria-label="Favorite games">
      ${cards}
    </section>
  `;
}

export function renderGameDetails(app, game, favorite) {
  const screenshots = game.screenshots || [];
  const screenshotMarkup = screenshots
    .slice(0, 3)
    .map((screenshot) => `<img src="${screenshot.image}" alt="Screenshot from ${game.title}">`)
    .join("");

  app.innerHTML = `
    <article class="detail-hero">
      <img src="${game.thumbnail}" alt="${game.title} cover image">
      <div class="detail-content">
        <div class="page-title">
          <h1>${game.title}</h1>
          <p>${game.short_description || "No short description available."}</p>
        </div>

        <ul class="detail-list">
          <li><strong>Store:</strong> ${game.genre || "Unknown"}</li>
          <li><strong>Type:</strong> ${game.platform || "Unknown"}</li>
          <li><strong>Publisher:</strong> ${game.publisher || "Unknown"}</li>
          <li><strong>Extra info:</strong> ${game.developer || "Unknown"}</li>
          <li><strong>Release date:</strong> ${game.release_date || "Unknown"}</li>
        </ul>

        <div class="button-row">
          <a class="button" href="${game.game_url}" target="_blank" rel="noopener noreferrer">View Deal</a>
          <button class="button ${favorite ? "danger" : "secondary"}" type="button" data-favorite-id="${game.id}">
            ${favorite ? "Remove Favorite" : "Save Favorite"}
          </button>
          <a class="button secondary" href="#/browse">Back to Browse</a>
        </div>
      </div>
    </article>

    <section class="panel">
      <h2>About ${game.title}</h2>
      <p>${game.description || "No detailed description is available for this game."}</p>
    </section>

    ${screenshotMarkup ? `
      <section class="panel">
        <h2>Screenshots</h2>
        <div class="screenshot-grid">${screenshotMarkup}</div>
      </section>
    ` : ""}
  `;
}

export function createGameCard(game, showRemoveButton = false) {
  const favoriteButton = showRemoveButton
    ? `<button class="small-button danger" type="button" data-remove-favorite="${game.id}">Remove</button>`
    : "";

  return `
    <article class="game-card">
      <img class="game-card__image" src="${game.thumbnail}" alt="${game.title} thumbnail">
      <div class="game-card__body">
        <h3>${game.title}</h3>
        <p>${game.short_description || "No description available."}</p>
        <ul class="tag-list">
          ${createPriceTags(game)}
          <li class="tag">${game.genre || "Unknown"}</li>
          <li class="tag">${game.platform || "Unknown platform"}</li>
        </ul>
        <div class="card-actions">
          <a class="small-button" href="#/game/${encodeURIComponent(game.id)}">Details</a>
          ${favoriteButton}
        </div>
      </div>
    </article>
  `;
}

function optionTemplate(value, label, selectedValue) {
  const selected = value === selectedValue ? "selected" : "";
  return `<option value="${value}" ${selected}>${formatText(label)}</option>`;
}

function createNotice(message) {
  if (!message) {
    return "";
  }

  return `
    <section class="state-box notice" aria-live="polite">
      <h2>API Notice</h2>
      <p>${message}</p>
    </section>
  `;
}

function createPriceTags(game) {
  if (!game.salePrice || !game.normalPrice) {
    return "";
  }

  const savingsTag = Number.isFinite(Number(game.savings))
    ? `<li class="tag">${game.savings}% off</li>`
    : "";

  return `
    <li class="tag">$${game.salePrice}</li>
    <li class="tag">Was $${game.normalPrice}</li>
    ${savingsTag}
  `;
}

function formatText(text) {
  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
