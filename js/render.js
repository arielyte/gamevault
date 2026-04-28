export const categories = [
  "mmorpg",
  "shooter",
  "strategy",
  "moba",
  "racing",
  "sports",
  "social",
  "sandbox",
  "open-world",
  "survival",
  "pvp",
  "pve"
];

export const platforms = [
  { value: "", label: "All platforms" },
  { value: "pc", label: "PC" },
  { value: "browser", label: "Browser" }
];

export const sortOptions = [
  { value: "", label: "Default relevance" },
  { value: "release-date", label: "Release date" },
  { value: "popularity", label: "Popularity" },
  { value: "alphabetical", label: "Alphabetical" },
  { value: "relevance", label: "Relevance" }
];

export function renderLoading(app, message = "Loading games...") {
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
      <p>If the browser blocks the request, FreeToGame may need a RapidAPI setup later.</p>
    </section>
  `;
}

export function renderEmpty(app, message = "No games matched your search.") {
  app.innerHTML = `
    <section class="state-box">
      <h2>No results</h2>
      <p>${message}</p>
    </section>
  `;
}

export function renderHome(app, featuredGames, favoritesCount, notice = "") {
  const cards = featuredGames.map((game) => createGameCard(game)).join("");

  app.innerHTML = `
    ${createNotice(notice)}

    <section class="hero">
      <div>
        <h1>GameVault</h1>
        <p>Discover free-to-play PC and browser games, filter by genre, and save favorites for later.</p>
      </div>
      <div class="hero-actions">
        <a class="button" href="#/browse">Browse Games</a>
        <a class="button secondary" href="#/favorites">View Favorites (${favoritesCount})</a>
      </div>
    </section>

    <section class="page-title" aria-labelledby="featured-title">
      <h2 id="featured-title">Featured Games</h2>
      <p>A small sample loaded from the FreeToGame API.</p>
    </section>

    <section class="game-grid" aria-label="Featured games">
      ${cards}
    </section>
  `;
}

export function renderBrowse(app, games, filters, notice = "") {
  const options = categories
    .map((category) => optionTemplate(category, category, filters.category))
    .join("");
  const platformOptions = platforms
    .map((platform) => optionTemplate(platform.value, platform.label, filters.platform))
    .join("");
  const sortByOptions = sortOptions
    .map((sortOption) => optionTemplate(sortOption.value, sortOption.label, filters.sortBy))
    .join("");
  const cards = games.map((game) => createGameCard(game)).join("");

  app.innerHTML = `
    ${createNotice(notice)}

    <section class="page-title">
      <h1>Browse Games</h1>
      <p>Search, filter, and sort free games from the FreeToGame API.</p>
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
            <label for="platform">Platform</label>
            <select id="platform" name="platform">${platformOptions}</select>
          </div>

          <div class="field">
            <label for="category">Category</label>
            <select id="category" name="category">
              <option value="">All categories</option>
              ${options}
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
          <strong>${games.length} games found</strong>
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
  const categoryButtons = categories
    .map((category) => `
      <article>
        <button class="category-button" type="button" data-category="${category}">
          <strong>${formatText(category)}</strong>
          <span>Browse ${formatText(category)} games</span>
        </button>
      </article>
    `)
    .join("");

  app.innerHTML = `
    <section class="page-title">
      <h1>Categories</h1>
      <p>Choose a genre to jump into a filtered Browse view.</p>
    </section>

    <section class="panel">
      <h2>Platforms</h2>
      <div class="button-row" aria-label="Platform links">
        <a class="button secondary" href="#/browse?platform=pc">PC Games</a>
        <a class="button secondary" href="#/browse?platform=browser">Browser Games</a>
      </div>
    </section>

    <section class="category-grid" aria-label="Game categories">
      ${categoryButtons}
    </section>
  `;
}

export function renderFavorites(app, favorites) {
  if (favorites.length === 0) {
    renderEmpty(app, "You have not saved any favorite games yet.");
    return;
  }

  const cards = favorites.map((game) => createGameCard(game, true)).join("");

  app.innerHTML = `
    <section class="page-title">
      <h1>Favorites</h1>
      <p>Your saved games are stored in this browser with LocalStorage.</p>
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
          <li><strong>Genre:</strong> ${game.genre || "Unknown"}</li>
          <li><strong>Platform:</strong> ${game.platform || "Unknown"}</li>
          <li><strong>Publisher:</strong> ${game.publisher || "Unknown"}</li>
          <li><strong>Developer:</strong> ${game.developer || "Unknown"}</li>
          <li><strong>Release date:</strong> ${game.release_date || "Unknown"}</li>
        </ul>

        <div class="button-row">
          <a class="button" href="${game.game_url}" target="_blank" rel="noopener noreferrer">Play Game</a>
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
          <li class="tag">${game.genre || "Unknown"}</li>
          <li class="tag">${game.platform || "Unknown platform"}</li>
        </ul>
        <div class="card-actions">
          <a class="small-button" href="#/game/${game.id}">Details</a>
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
      <h2>Development API Notice</h2>
      <p>${message}</p>
    </section>
  `;
}

function formatText(text) {
  return text
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
