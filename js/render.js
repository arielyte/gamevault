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

export function renderHome(app, featuredGames, favoritesCount, totalGames = featuredGames.length) {
  const cards = featuredGames.map((game) => createGameCard(game)).join("");
  const featuredText = `Showing ${featuredGames.length} featured deals from ${totalGames} unique live CheapShark results.`;

  app.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <div>
          <h1>GameVault</h1>
          <p>Discover live PC game deals, compare discounts, and save your favorite deals.</p>
        </div>
        <div class="hero-actions">
          <a class="button" href="#/browse">Browse Deals</a>
          <a class="button secondary" href="#/favorites">View Favorites (${favoritesCount})</a>
        </div>
      </div>
      <div class="hero-image-frame">
        <img
          class="hero-image"
          src="./assets/cat.jpg"
          alt="Cat wearing earphones"
          onerror="this.onerror=null; this.src='./assets/placeholder.png';"
        >
      </div>
    </section>

    <section class="page-title featured-page-title" aria-labelledby="featured-title">
      <h2 id="featured-title">Featured Deals</h2>
      <p>${featuredText}</p>
    </section>

    <section class="game-grid" aria-label="Featured deals">
      ${cards}
    </section>
  `;
}

export function renderBrowse(app, games, filters) {
  const storeOptions = stores
    .map((store) => optionTemplate(store.value, store.label, filters.storeID))
    .join("");
  const sortByOptions = sortOptions
    .map((sortOption) => optionTemplate(sortOption.value, sortOption.label, filters.sortBy))
    .join("");
  const cards = games.map((game) => createGameCard(game)).join("");

  app.innerHTML = `
    <section class="page-title browse-page-title">
      <h1>Browse Deals</h1>
      <p>Browse discounted games from CheapShark with live search, filters, and sorting.</p>
    </section>

    <section class="browse-layout">
      <section class="panel browse-filter-panel" aria-label="Deal filters">
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
              <option value="free" ${filters.maxPrice === "free" ? "selected" : ""}>Free</option>
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
      </section>

      <section aria-label="Deal results">
        <div class="results-header">
          <strong>${games.length} unique deals found</strong>
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
      <h1>Categories</h1>
      <p>Choose a store or deal collection to jump into a filtered Browse view.</p>
    </section>

    <section class="category-section" aria-labelledby="platform-title">
      <div class="section-heading">
        <h2 id="platform-title">Stores</h2>
        <p>Start with where you want to shop.</p>
      </div>
      <div class="platform-grid" aria-label="Store links">
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

    <section class="game-grid" aria-label="Favorite deals">
      ${cards}
    </section>
  `;
}

export function renderGameDetails(app, game, favorite) {
  if (game.isValidDeal === false) {
    renderExpiredDeal(app);
    return;
  }

  const stats = createDetailStats(game);
  const otherDeals = createOtherDealsMarkup(game.cheaperStores || []);
  const freeBadge = isFreeDeal(game) ? `<span class="free-badge detail-free-badge">FREE</span>` : "";

  app.innerHTML = `
    <article class="detail-hero">
      <div class="detail-image-frame">
        <img
          class="detail-image"
          src="${game.image || game.thumbnail || "./assets/placeholder.png"}"
          alt="${game.title} deal artwork"
          onerror="this.onerror=null; this.src='${game.fallbackImage || game.thumbnail || "./assets/placeholder.png"}';"
        >
      </div>
      <div class="detail-content">
        <div class="page-title">
          ${freeBadge}
          <h1>${game.title}</h1>
          <p>${game.short_description || "No short description available."}</p>
        </div>

        <div class="button-row">
          <a class="button" href="${game.dealUrl || game.game_url}" target="_blank" rel="noopener noreferrer">View Deal</a>
          <button class="button ${favorite ? "danger" : "secondary"}" type="button" data-favorite-id="${game.id}">
            ${favorite ? "Remove Favorite" : "Save Favorite"}
          </button>
          ${game.steamUrl ? `<a class="button secondary" href="${game.steamUrl}" target="_blank" rel="noopener noreferrer">Steam Page</a>` : ""}
          ${game.metacriticLink ? `<a class="button secondary" href="${game.metacriticLink}" target="_blank" rel="noopener noreferrer">Metacritic</a>` : ""}
          <a class="button secondary" href="#/browse">Back to Browse</a>
        </div>
      </div>
    </article>

    <section class="detail-stats" aria-label="Deal stats">
      ${stats}
    </section>

    <section class="panel">
      <h2>Deal Overview</h2>
      <p>${game.description || "CheapShark did not provide enough detail text for this deal."}</p>
    </section>

    <section class="panel">
      <h2>Other current deals</h2>
      ${otherDeals}
    </section>
  `;
}

function renderExpiredDeal(app) {
  app.innerHTML = `
    <section class="state-box" aria-live="polite">
      <h1>This deal is no longer discounted.</h1>
      <p>GameVault only displays active discounted PC game deals.</p>
      <a class="button" href="#/browse">Back to Browse</a>
    </section>
  `;
}

export function createGameCard(game, showRemoveButton = false) {
  const favoriteButton = showRemoveButton
    ? `<button class="small-button danger" type="button" data-remove-favorite="${game.id}">Remove</button>`
    : "";
  const freeBadge = isFreeDeal(game) ? `<span class="free-badge card-free-badge">FREE</span>` : "";
  const description = isDiscountedDeal(game)
    ? game.short_description || "No description available."
    : "This deal is no longer discounted.";

  return `
    <article class="game-card">
      ${freeBadge}
      <img
        class="game-card__image"
        src="${game.image || game.thumbnail || "./assets/placeholder.png"}"
        alt="${game.title} deal artwork"
        loading="lazy"
        onerror="this.onerror=null; this.src='${game.fallbackImage || game.thumbnail || "./assets/placeholder.png"}';"
      >
      <div class="game-card__body">
        <h3>${game.title}</h3>
        <p>${description}</p>
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

function createPriceTags(game) {
  if (!hasPriceValue(game.salePrice) || !hasPriceValue(game.normalPrice)) {
    return "";
  }

  if (!isDiscountedDeal(game)) {
    return "";
  }

  const savingsTag = Number(game.savings) > 0
    ? `<li class="tag">${game.savings}% off</li>`
    : "";
  const priceTag = isFreeDeal(game)
    ? `<li class="tag free-price-tag">FREE</li>`
    : `<li class="tag">${formatMoney(game.salePrice)}</li>`;

  return `
    ${priceTag}
    <li class="tag">Was ${formatMoney(game.normalPrice)}</li>
    ${savingsTag}
  `;
}

function createDetailStats(game) {
  const stats = [
    createStatCard("Sale price", formatMoney(game.salePrice), game.storeName),
    createStatCard("Retail price", formatMoney(game.retailPrice || game.normalPrice), "Regular listed price"),
    createStatCard("Savings", formatPercent(game.savings), "Compared with retail price"),
    createStatCard("Store", game.storeName, game.storeId ? `Store ID ${game.storeId}` : ""),
    createStatCard("Deal rating", game.dealRating ? `${game.dealRating}/10` : "", "CheapShark score"),
    createStatCard("Steam rating", game.steamRatingText, createSteamRatingSubtext(game)),
    createStatCard("Metacritic", game.metacriticScore, "Critic score"),
    createStatCard("Historical low", formatMoney(game.cheapestHistoricalPrice), formatDateText(game.cheapestHistoricalDate))
  ];

  const visibleStats = stats.filter(Boolean).join("");

  return visibleStats || `
    <article class="stat-card">
      <span>Details</span>
      <strong>Not provided</strong>
      <small>CheapShark did not provide extra deal stats.</small>
    </article>
  `;
}

function createStatCard(label, value, subtext = "") {
  if (!hasDisplayValue(value)) {
    return "";
  }

  return `
    <article class="stat-card">
      <span>${label}</span>
      <strong>${value}</strong>
      ${hasDisplayValue(subtext) ? `<small>${subtext}</small>` : ""}
    </article>
  `;
}

function createOtherDealsMarkup(deals) {
  const validDeals = deals.filter(isDiscountedDeal);

  if (!validDeals.length) {
    return `<p class="muted-note">No cheaper current deals found.</p>`;
  }

  const rows = validDeals.map((deal) => `
    <article class="comparison-card">
      <div>
        <strong>${deal.storeName}</strong>
        <span>${formatDealPriceLine(deal)}</span>
      </div>
      ${isFreeDeal(deal) ? `<span class="free-badge">FREE</span>` : ""}
      ${Number(deal.savings) > 0 ? `<span class="tag">${deal.savings}% off</span>` : ""}
      ${deal.dealUrl ? `<a class="small-button secondary" href="${deal.dealUrl}" target="_blank" rel="noopener noreferrer">View</a>` : ""}
    </article>
  `).join("");

  return `<div class="comparison-list">${rows}</div>`;
}

function createSteamRatingSubtext(game) {
  const parts = [];

  if (hasDisplayValue(game.steamRatingPercent)) {
    parts.push(`${game.steamRatingPercent}% positive`);
  }

  if (hasDisplayValue(game.steamRatingCount)) {
    parts.push(`${Number(game.steamRatingCount).toLocaleString()} reviews`);
  }

  return parts.join(" from ");
}

function formatMoney(value) {
  if (!hasPriceValue(value)) {
    return "";
  }

  if (Number(value) === 0) {
    return "FREE";
  }

  return `$${value}`;
}

function formatDealPriceLine(deal) {
  const salePrice = formatMoney(deal.salePrice);
  const retailPrice = formatMoney(deal.retailPrice);

  if (!salePrice) {
    return "";
  }

  return retailPrice ? `${salePrice} instead of ${retailPrice}` : salePrice;
}

function formatPercent(value) {
  if (!Number.isFinite(Number(value))) {
    return "";
  }

  return `${value}%`;
}

function formatDateText(value) {
  if (!hasDisplayValue(value) || value === "Unknown") {
    return "";
  }

  return `Recorded on ${value}`;
}

function hasDisplayValue(value) {
  return value !== undefined && value !== null && value !== "" && value !== "0" && value !== "N/A" && value !== "Unknown";
}

function hasPriceValue(value) {
  return value !== undefined && value !== null && value !== "" && value !== "N/A" && value !== "Unknown" && Number.isFinite(Number(value));
}

function isFreeDeal(deal) {
  const salePrice = Number(deal.salePriceValue ?? deal.salePrice);
  const retailPrice = Number(deal.retailPriceValue ?? deal.retailPrice ?? deal.normalPriceValue ?? deal.normalPrice);
  const savings = Number(deal.savings);

  return (
    Number.isFinite(salePrice) &&
    Number.isFinite(retailPrice) &&
    Number.isFinite(savings) &&
    salePrice === 0 &&
    retailPrice > 0 &&
    savings > 0
  );
}

function isDiscountedDeal(deal) {
  const salePrice = Number(deal.salePriceValue ?? deal.salePrice);
  const retailPrice = Number(deal.retailPriceValue ?? deal.retailPrice ?? deal.normalPriceValue ?? deal.normalPrice);
  const savings = Number(deal.savings);

  return (
    Number.isFinite(salePrice) &&
    Number.isFinite(retailPrice) &&
    Number.isFinite(savings) &&
    retailPrice > 0 &&
    salePrice < retailPrice &&
    savings > 0
  );
}

function formatText(text) {
  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
