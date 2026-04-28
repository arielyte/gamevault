const API_BASE_URL = "https://www.cheapshark.com/api/1.0";
const DEALS_PAGE_SIZE = 60;
const DEFAULT_STORE_NAMES = {
  1: "Steam",
  7: "GOG",
  11: "Humble Store",
  15: "Fanatical",
  23: "GameBillet",
  25: "Epic Games Store",
  30: "IndieGala"
};
let storeNames = { ...DEFAULT_STORE_NAMES };

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

    console.log("[GameVault API] Live API fetch succeeded.");
    console.log("[GameVault API] Items returned:", itemCount);

    return data;
  } catch (error) {
    console.error("[GameVault API] Live API fetch failed exactly here:", error);
    throw error;
  }
}

export async function getGames(filters = {}) {
  await fetchStores();

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

  const deals = await request(`/deals?${params.toString()}`);
  const uniqueDeals = deduplicateDeals(deals);

  console.log("[GameVault API] Raw CheapShark results:", deals.length);
  console.log("[GameVault API] Unique deals after deduplication:", uniqueDeals.length);

  return uniqueDeals.map(mapDealToGame);
}

export async function getGameDetails(id) {
  await fetchStores();

  const deal = await request(`/deals?id=${id}`);

  if (!deal.gameInfo) {
    throw new Error("CheapShark did not return details for this deal.");
  }

  return mapDealDetailsToGame(id, deal);
}

function mapDealToGame(deal) {
  const savings = Math.round(Number(deal.savings || 0));
  const image = getBestImageUrl(deal);
  const fallbackImage = deal.thumb || "./assets/placeholder.svg";

  return {
    id: deal.dealID,
    title: deal.title,
    image,
    thumbnail: deal.thumb,
    fallbackImage,
    short_description: `$${deal.salePrice} deal, usually $${deal.normalPrice}. Save ${savings}%.`,
    game_url: `https://www.cheapshark.com/redirect?dealID=${deal.dealID}`,
    genre: getStoreName(deal.storeID),
    storeName: getStoreName(deal.storeID),
    storeId: deal.storeID,
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
  const image = getBestImageUrl(info);
  const fallbackImage = info.thumb || "./assets/placeholder.svg";
  const savings = calculateSavings(info.salePrice, info.retailPrice);
  const releaseDate = formatUnixDate(info.releaseDate);
  const historicalPrice = deal.cheapestPrice || {};

  return {
    id,
    title: info.name,
    image,
    thumbnail: info.thumb,
    fallbackImage,
    short_description: createDealSummary(info.salePrice, info.retailPrice, savings),
    game_url: createDealUrl(id),
    dealUrl: createDealUrl(id),
    genre: getStoreName(info.storeID),
    platform: "PC deal",
    publisher: cleanValue(info.publisher),
    developer: "See store page",
    release_date: releaseDate,
    releaseDate,
    description: createDealOverview({
      title: info.name,
      salePrice: info.salePrice,
      retailPrice: info.retailPrice,
      savings,
      dealRating: deal.dealRating,
      steamRatingText: info.steamRatingText,
      metacriticScore: info.metacriticScore
    }),
    screenshots: [],
    salePrice: info.salePrice,
    normalPrice: info.retailPrice,
    retailPrice: info.retailPrice,
    savings,
    storeName: getStoreName(info.storeID),
    storeId: info.storeID,
    dealRating: deal.dealRating,
    steamRatingText: cleanValue(info.steamRatingText),
    steamRatingPercent: cleanValue(info.steamRatingPercent),
    steamRatingCount: cleanValue(info.steamRatingCount),
    metacriticScore: cleanValue(info.metacriticScore),
    metacriticLink: createMetacriticUrl(info.metacriticLink),
    steamAppId: cleanValue(info.steamAppID || info.steamAppId),
    steamUrl: createSteamUrl(info.steamAppID || info.steamAppId),
    cheaperStores: mapCheaperStores(deal.cheaperStores || []),
    cheapestHistoricalPrice: cleanValue(historicalPrice.price),
    cheapestHistoricalDate: formatUnixDate(historicalPrice.date)
  };
}

async function fetchStores() {
  if (Object.keys(storeNames).length > Object.keys(DEFAULT_STORE_NAMES).length) {
    return;
  }

  try {
    const stores = await request("/stores");

    stores.forEach((store) => {
      if (store.isActive) {
        storeNames[store.storeID] = store.storeName;
      }
    });
  } catch (error) {
    console.warn("[GameVault API] Store names could not be refreshed. Default names will be used.", error);
  }
}

function mapCheaperStores(stores) {
  return stores.map((store) => ({
    storeId: store.storeID,
    storeName: getStoreName(store.storeID),
    salePrice: store.salePrice,
    retailPrice: store.retailPrice,
    savings: calculateSavings(store.salePrice, store.retailPrice),
    dealId: store.dealID,
    dealUrl: store.dealID ? createDealUrl(store.dealID) : ""
  }));
}

function createDealSummary(salePrice, retailPrice, savings) {
  if (hasValue(salePrice) && hasValue(retailPrice) && Number.isFinite(savings)) {
    return `Currently $${salePrice} instead of $${retailPrice} — save ${savings}%.`;
  }

  if (hasValue(salePrice)) {
    return `Current deal price: $${salePrice}.`;
  }

  return "Live CheapShark deal details.";
}

function createDealOverview(details) {
  const sentences = [];

  if (hasValue(details.salePrice) && hasValue(details.retailPrice) && Number.isFinite(details.savings)) {
    sentences.push(`This deal lists ${details.title} for $${details.salePrice} instead of $${details.retailPrice}, saving ${details.savings}%.`);
  } else if (hasValue(details.salePrice)) {
    sentences.push(`This deal lists ${details.title} for $${details.salePrice}.`);
  }

  if (hasValue(details.dealRating)) {
    sentences.push(`CheapShark rates this deal ${details.dealRating}/10.`);
  }

  if (hasValue(details.steamRatingText)) {
    sentences.push(`The game has a ${details.steamRatingText} Steam rating.`);
  }

  if (hasValue(details.metacriticScore)) {
    sentences.push(`Its Metacritic score is ${details.metacriticScore}.`);
  }

  return sentences.join(" ") || "CheapShark did not provide enough detail text for this deal.";
}

function formatUnixDate(timestamp) {
  if (!timestamp || Number(timestamp) <= 0) {
    return "Unknown";
  }

  return new Date(Number(timestamp) * 1000).toISOString().slice(0, 10);
}

function getStoreName(storeID) {
  return storeNames[storeID] || `Store #${storeID}`;
}

function getBestImageUrl(gameData) {
  const steamAppID = gameData.steamAppID || gameData.steamAppId;

  if (steamAppID) {
    return `https://cdn.cloudflare.steamstatic.com/steam/apps/${steamAppID}/header.jpg`;
  }

  if (isSteamImageUrl(gameData.thumb)) {
    return gameData.thumb.replace(/capsule_sm_120\.jpg|capsule_231x87\.jpg/, "header.jpg");
  }

  return gameData.thumb || "./assets/placeholder.svg";
}

function isSteamImageUrl(imageUrl) {
  if (!imageUrl) {
    return false;
  }

  const isSteamHost = imageUrl.includes("steamstatic.com") || imageUrl.includes("akamaihd.net");
  const isSmallCapsule = imageUrl.includes("capsule_sm_120.jpg") || imageUrl.includes("capsule_231x87.jpg");

  return isSteamHost && isSmallCapsule;
}

function calculateSavings(salePrice, retailPrice) {
  const sale = Number(salePrice);
  const retail = Number(retailPrice);

  if (!Number.isFinite(sale) || !Number.isFinite(retail) || retail <= 0) {
    return null;
  }

  return Math.round(((retail - sale) / retail) * 100);
}

function cleanValue(value) {
  if (value === undefined || value === null || value === "" || value === "0" || value === "N/A") {
    return "";
  }

  return value;
}

function hasValue(value) {
  return cleanValue(value) !== "";
}

function createDealUrl(dealId) {
  return `https://www.cheapshark.com/redirect?dealID=${dealId}`;
}

function createSteamUrl(steamAppId) {
  return steamAppId ? `https://store.steampowered.com/app/${steamAppId}` : "";
}

function createMetacriticUrl(path) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http")) {
    return path;
  }

  return `https://www.metacritic.com${path}`;
}
