import { getGameDetails, getGames, isValidDeal } from "./api.js";
import { addFavorite, getFavorites, isFavorite, removeFavorite } from "./storage.js";
import {
  renderBrowse,
  renderCategories,
  renderError,
  renderFavorites,
  renderGameDetails,
  renderHome,
  renderLoading
} from "./render.js";
import { getRoute, setActiveNav, startRouter } from "./router.js";

const app = document.querySelector("#app");

startRouter(renderCurrentRoute);

async function renderCurrentRoute() {
  const route = getRoute();
  setActiveNav(route.page);
  app.focus();

  if (route.page === "home") {
    await showHome();
    return;
  }

  if (route.page === "browse") {
    await showBrowse(route.query);
    return;
  }

  if (route.page === "categories") {
    showCategories();
    return;
  }

  if (route.page === "favorites") {
    showFavorites();
    return;
  }

  if (route.page === "game" && route.id) {
    await showGameDetails(route.id);
    return;
  }

  window.location.hash = "#/home";
}

async function showHome() {
  renderLoading(app, "Loading featured deals...");

  try {
    const games = await getGames();
    renderHome(app, games.slice(0, 6), getFavorites().length, games.length);
  } catch (error) {
    renderError(app, createApiErrorMessage(error));
  }
}

async function showBrowse(query) {
  const filters = {
    search: query.get("search") || "",
    storeID: query.get("storeID") || "",
    maxPrice: query.get("maxPrice") || "",
    sortBy: query.get("sortBy") || ""
  };

  renderLoading(app, "Loading deals...");

  try {
    const games = await getGames(filters);
    const visibleGames = applyBrowseFilters(games, filters);

    if (visibleGames.length === 0) {
      renderBrowse(app, [], filters);
      renderEmptyInsideResults();
    } else {
      renderBrowse(app, visibleGames, filters);
    }

    connectBrowseControls();
  } catch (error) {
    renderError(app, createApiErrorMessage(error));
  }
}

function showCategories() {
  renderCategories(app);

  const browseButtons = document.querySelectorAll("[data-browse-query]");

  browseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      window.location.hash = `#/browse?${button.dataset.browseQuery}`;
    });
  });
}

function showFavorites() {
  renderFavorites(app, getFavorites());

  const removeButtons = document.querySelectorAll("[data-remove-favorite]");

  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      removeFavorite(button.dataset.removeFavorite);
      showFavorites();
    });
  });
}

async function showGameDetails(gameId) {
  renderLoading(app, "Loading deal details...");

  try {
    const game = await getGameDetails(gameId);
    renderGameDetails(app, game, isFavorite(game.id));
    connectFavoriteButton(game);
  } catch (error) {
    renderError(app, createApiErrorMessage(error));
  }
}

function connectBrowseControls() {
  const form = document.querySelector("#filter-form");
  const clearButton = document.querySelector("#clear-filters");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      if (value) {
        params.set(key, value);
      }
    }

    window.location.hash = params.toString() ? `#/browse?${params}` : "#/browse";
  });

  clearButton.addEventListener("click", () => {
    window.location.hash = "#/browse";
  });
}

function connectFavoriteButton(game) {
  const button = document.querySelector("[data-favorite-id]");

  if (!button) {
    return;
  }

  button.addEventListener("click", () => {
    if (isFavorite(game.id)) {
      removeFavorite(game.id);
    } else {
      addFavorite(createFavoriteSummary(game));
    }

    renderGameDetails(app, game, isFavorite(game.id));
    connectFavoriteButton(game);
  });
}

function applyBrowseFilters(games, filters) {
  return filterGamesByMaxPrice(filterGamesBySearch(games, filters.search), filters.maxPrice);
}

function filterGamesBySearch(games, searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  if (!normalizedSearch) {
    return games;
  }

  return games.filter((game) => game.title.toLowerCase().includes(normalizedSearch));
}

function filterGamesByMaxPrice(games, maxPrice) {
  if (maxPrice !== "free") {
    return games;
  }

  return games.filter((game) => {
    const salePrice = Number(game.salePriceValue ?? game.salePrice);

    return Number.isFinite(salePrice) && salePrice === 0 && isValidDeal(game);
  });
}

function renderEmptyInsideResults() {
  const resultsArea = document.querySelector("[aria-label='Deal results']");
  const grid = resultsArea.querySelector(".game-grid");
  grid.innerHTML = `
    <section class="state-box">
      <h2>No discounted deals found.</h2>
      <p>Try changing the search text, store, maximum price, or sort option.</p>
    </section>
  `;
}

function createFavoriteSummary(game) {
  return {
    id: game.id,
    title: game.title,
    thumbnail: game.thumbnail,
    short_description: game.short_description,
    genre: game.genre,
    platform: game.platform,
    salePrice: game.salePrice,
    salePriceValue: game.salePriceValue,
    normalPrice: game.normalPrice,
    normalPriceValue: game.normalPriceValue,
    savings: game.savings
  };
}

function createApiErrorMessage(error) {
  return `${error.message} Please check the console for the exact API request URL and error details.`;
}
