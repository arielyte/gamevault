const API_BASE_URL = "https://www.cheapshark.com/api/1.0";
const DEALS_PAGE_SIZE = 60;
const STORE_NAMES = {
  1: "Steam",
  7: "GOG",
  11: "Humble Store",
  15: "Fanatical",
  23: "GameBillet",
  25: "Epic Games Store",
  30: "IndieGala"
};

let apiStatusMessage = "";
let apiDataSource = "live";

// API pivot notes:
// Option A: Use FreeToGame through RapidAPI if API keys are allowed by the teacher.
// Option B: Use CheapShark directly from the browser. This version uses Option B
// because CheapShark sends CORS headers and does not require secrets for basic data.

// Development backup only. These are not live API results.
const developmentFallbackDeals = [
  {
    id: "development-fallback-1",
    title: "Development Fallback Deal 1",
    thumbnail: "./assets/blue-galaxy-wallpaper.webp",
    short_description: "Development fallback only. Live CheapShark data did not load.",
    game_url: "https://www.cheapshark.com/",
    genre: "Development fallback",
    platform: "Browser/API backup",
    publisher: "Development fallback only",
    developer: "Development fallback only",
    release_date: "Unavailable",
    description: "This temporary item appears only if the live CheapShark API request fails.",
    screenshots: []
  },
  {
    id: "development-fallback-2",
    title: "Development Fallback Deal 2",
    thumbnail: "./assets/blue-galaxy-wallpaper.webp",
    short_description: "Development fallback only. Live CheapShark data did not load.",
    game_url: "https://www.cheapshark.com/",
    genre: "Development fallback",
    platform: "Browser/API backup",
    publisher: "Development fallback only",
    developer: "Development fallback only",
    release_date: "Unavailable",
    description: "This temporary item appears only if the live CheapShark API request fails.",
    screenshots: []
  }
];

async function request(path) {
  const requestUrl = `${API_BASE_URL}${path}`;
  console.log("[GameVault API] Request URL:", requestUrl);
  console.log("[GameVault API] Live API fetch starting.");

  try {
    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error(`CheapShark request failed with status ${response.status}.`);
    }

    const data = await response.json();
    const itemCount = Array.isArray(data) ? data.length : 1;

    apiStatusMessage = "";
    apiDataSource = "live";
    console.log("[GameVault API] Live API fetch succeeded.");
    console.log("[GameVault API] Items returned:", itemCount);

    return data;
  } catch (error) {
    apiStatusMessage = "The live CheapShark API request failed. Showing temporary development backup data only so the interface can still be tested.";
    apiDataSource = "fallback";
    console.error("[GameVault API] Live API fetch failed exactly here:", error);
    console.warn("[GameVault API] Temporary development backup data is being used.");
    throw error;
  }
}

export async function getGames(filters = {}) {
  const params = new URLSearchParams();
  params.set("pageSize", DEALS_PAGE_SIZE);

  if (filters.search) {
    params.set("title", filters.search);
  }

  if (filters.storeID) {
    params.set("storeID", filters.storeID);
  }

  if (filters.maxPrice) {
    params.set("upperPrice", filters.maxPrice);
  }

  if (filters.sortBy) {
    params.set("sortBy", filters.sortBy);
  }

  try {
    const deals = await request(`/deals?${params.toString()}`);
    const uniqueDeals = deduplicateDeals(deals);

    console.log("[GameVault API] Raw CheapShark results:", deals.length);
    console.log("[GameVault API] Unique deals after deduplication:", uniqueDeals.length);

    return uniqueDeals.map(mapDealToGame);
  } catch (error) {
    console.warn("[GameVault API] Fallback games returned:", developmentFallbackDeals.length);
    return developmentFallbackDeals;
  }
}

export async function getGameDetails(id) {
  if (id.startsWith("development-fallback")) {
    return getFallbackDetails(id);
  }

  try {
    const deal = await request(`/deals?id=${id}`);
    return mapDealDetailsToGame(id, deal);
  } catch (error) {
    return getFallbackDetails(id);
  }
}

export function getApiStatusMessage() {
  return apiStatusMessage;
}

export function getApiDataSource() {
  return apiDataSource;
}

function mapDealToGame(deal) {
  const savings = Math.round(Number(deal.savings || 0));

  return {
    id: deal.dealID,
    title: deal.title,
    thumbnail: deal.thumb,
    short_description: `$${deal.salePrice} deal, usually $${deal.normalPrice}. Save ${savings}%.`,
    game_url: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
    genre: getStoreName(deal.storeID),
    platform: "PC deal",
    publisher: "See store page",
    developer: "See store page",
    release_date: formatUnixDate(deal.releaseDate),
    description: `CheapShark live deal for ${deal.title}. Sale price: $${deal.salePrice}. Normal price: $${deal.normalPrice}. Deal rating: ${deal.dealRating || "N/A"}. Steam rating: ${deal.steamRatingText || "N/A"}.`,
    screenshots: [],
    salePrice: deal.salePrice,
    normalPrice: deal.normalPrice,
    savings,
    dealRating: deal.dealRating,
    storeID: deal.storeID
  };
}

function deduplicateDeals(deals) {
  const bestDeals = new Map();

  deals.forEach((deal) => {
    const key = getDealKey(deal);
    const savedDeal = bestDeals.get(key);

    if (!savedDeal || isBetterDeal(deal, savedDeal)) {
      bestDeals.set(key, deal);
    }
  });

  return Array.from(bestDeals.values());
}

function getDealKey(deal) {
  if (deal.gameID) {
    return `game-${deal.gameID}`;
  }

  return normalizeTitle(deal.title);
}

function normalizeTitle(title) {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function isBetterDeal(newDeal, savedDeal) {
  const newSavings = Number(newDeal.savings);
  const savedSavings = Number(savedDeal.savings);

  if (Number.isFinite(newSavings) && Number.isFinite(savedSavings) && newSavings !== savedSavings) {
    return newSavings > savedSavings;
  }

  return Number(newDeal.salePrice) < Number(savedDeal.salePrice);
}

function mapDealDetailsToGame(id, deal) {
  const info = deal.gameInfo;

  return {
    id,
    title: info.name,
    thumbnail: info.thumb,
    short_description: `$${info.salePrice} deal, usually $${info.retailPrice}.`,
    game_url: `https://www.cheapshark.com/redirect?dealID=${id}`,
    genre: getStoreName(info.storeID),
    platform: "PC deal",
    publisher: info.publisher || "See store page",
    developer: "See store page",
    release_date: formatUnixDate(info.releaseDate),
    description: `This is live CheapShark deal data. Current sale price is $${info.salePrice}, retail price is $${info.retailPrice}, Metacritic score is ${info.metacriticScore || "N/A"}, and Steam rating is ${info.steamRatingText || "N/A"}.`,
    screenshots: [],
    salePrice: info.salePrice,
    normalPrice: info.retailPrice,
    metacriticScore: info.metacriticScore,
    steamRatingText: info.steamRatingText,
    steamRatingPercent: info.steamRatingPercent,
    steamRatingCount: info.steamRatingCount
  };
}

function getFallbackDetails(id) {
  const fallbackDeal = developmentFallbackDeals.find((deal) => deal.id === id);

  if (fallbackDeal) {
    apiDataSource = "fallback";
    return fallbackDeal;
  }

  throw new Error("The live API failed, and this item does not exist in the temporary development backup data.");
}

function formatUnixDate(timestamp) {
  if (!timestamp || Number(timestamp) <= 0) {
    return "Unknown";
  }

  return new Date(Number(timestamp) * 1000).toISOString().slice(0, 10);
}

function getStoreName(storeID) {
  return STORE_NAMES[storeID] || `Store #${storeID}`;
}
