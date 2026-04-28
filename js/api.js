const API_BASE_URL = "https://www.freetogame.com/api";
let apiStatusMessage = "";

// Development fallback only. Remove before final submission if the live API/RapidAPI setup is working.
const developmentFallbackGames = [
  {
    id: 540,
    title: "Overwatch 2",
    thumbnail: "https://www.freetogame.com/g/540/thumbnail.jpg",
    short_description: "Development fallback sample: team-based hero shooter.",
    game_url: "https://www.freetogame.com/open/overwatch-2",
    genre: "Shooter",
    platform: "PC",
    publisher: "Activision Blizzard",
    developer: "Blizzard Entertainment",
    release_date: "2022-10-04",
    description: "This is temporary development fallback data used when the browser blocks the live FreeToGame API request.",
    screenshots: []
  },
  {
    id: 516,
    title: "PUBG: BATTLEGROUNDS",
    thumbnail: "https://www.freetogame.com/g/516/thumbnail.jpg",
    short_description: "Development fallback sample: battle royale shooter.",
    game_url: "https://www.freetogame.com/open/pubg",
    genre: "Shooter",
    platform: "PC",
    publisher: "KRAFTON, Inc.",
    developer: "KRAFTON, Inc.",
    release_date: "2022-01-12",
    description: "This is temporary development fallback data used when the browser blocks the live FreeToGame API request.",
    screenshots: []
  },
  {
    id: 521,
    title: "Diablo Immortal",
    thumbnail: "https://www.freetogame.com/g/521/thumbnail.jpg",
    short_description: "Development fallback sample: action RPG adventure.",
    game_url: "https://www.freetogame.com/open/diablo-immortal",
    genre: "MMOARPG",
    platform: "PC",
    publisher: "Blizzard Entertainment",
    developer: "Blizzard Entertainment",
    release_date: "2022-06-02",
    description: "This is temporary development fallback data used when the browser blocks the live FreeToGame API request.",
    screenshots: []
  },
  {
    id: 517,
    title: "Lost Ark",
    thumbnail: "https://www.freetogame.com/g/517/thumbnail.jpg",
    short_description: "Development fallback sample: fantasy MMORPG.",
    game_url: "https://www.freetogame.com/open/lost-ark",
    genre: "MMORPG",
    platform: "PC",
    publisher: "Amazon Games",
    developer: "Smilegate RPG",
    release_date: "2022-02-11",
    description: "This is temporary development fallback data used when the browser blocks the live FreeToGame API request.",
    screenshots: []
  },
  {
    id: 475,
    title: "Genshin Impact",
    thumbnail: "https://www.freetogame.com/g/475/thumbnail.jpg",
    short_description: "Development fallback sample: open-world action RPG.",
    game_url: "https://www.freetogame.com/open/genshin-impact",
    genre: "Action RPG",
    platform: "PC",
    publisher: "miHoYo",
    developer: "miHoYo",
    release_date: "2020-09-28",
    description: "This is temporary development fallback data used when the browser blocks the live FreeToGame API request.",
    screenshots: []
  },
  {
    id: 23,
    title: "Apex Legends",
    thumbnail: "https://www.freetogame.com/g/23/thumbnail.jpg",
    short_description: "Development fallback sample: fast battle royale shooter.",
    game_url: "https://www.freetogame.com/open/apex-legends",
    genre: "Shooter",
    platform: "PC",
    publisher: "Electronic Arts",
    developer: "Respawn Entertainment",
    release_date: "2019-02-04",
    description: "This is temporary development fallback data used when the browser blocks the live FreeToGame API request.",
    screenshots: []
  },
  {
    id: 57,
    title: "Fortnite",
    thumbnail: "https://www.freetogame.com/g/57/thumbnail.jpg",
    short_description: "Development fallback sample: building and battle royale game.",
    game_url: "https://www.freetogame.com/open/fortnite",
    genre: "Shooter",
    platform: "PC",
    publisher: "Epic Games",
    developer: "Epic Games",
    release_date: "2017-09-26",
    description: "This is temporary development fallback data used when the browser blocks the live FreeToGame API request.",
    screenshots: []
  },
  {
    id: 213,
    title: "RuneScape",
    thumbnail: "https://www.freetogame.com/g/213/thumbnail.jpg",
    short_description: "Development fallback sample: long-running browser MMORPG.",
    game_url: "https://www.freetogame.com/open/runescape",
    genre: "MMORPG",
    platform: "Web Browser",
    publisher: "Jagex",
    developer: "Jagex",
    release_date: "2001-01-04",
    description: "This is temporary development fallback data used when the browser blocks the live FreeToGame API request.",
    screenshots: []
  }
];

async function request(path) {
  const requestUrl = `${API_BASE_URL}${path}`;
  console.log("[GameVault API] Request:", requestUrl);

  try {
    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error(`FreeToGame request failed with status ${response.status}.`);
    }

    apiStatusMessage = "";
    return response.json();
  } catch (error) {
    console.error("[GameVault API] Request failed:", requestUrl, error);
    apiStatusMessage = "The live FreeToGame API request may be blocked by the browser/CORS. Showing temporary development fallback data so the frontend can still be tested.";
    throw error;
  }
}

export async function getGames(filters = {}) {
  const params = new URLSearchParams();

  if (filters.platform) {
    params.set("platform", filters.platform);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.sortBy) {
    params.set("sort-by", filters.sortBy);
  }

  const query = params.toString();
  const path = query ? `/games?${query}` : "/games";

  try {
    return await request(path);
  } catch (error) {
    console.warn("[GameVault API] Using development fallback game list.", error);
    return filterFallbackGames(filters);
  }
}

export async function getGameDetails(id) {
  try {
    return await request(`/game?id=${encodeURIComponent(id)}`);
  } catch (error) {
    const fallbackGame = developmentFallbackGames.find((game) => String(game.id) === String(id));

    if (fallbackGame) {
      console.warn("[GameVault API] Using development fallback game details.", fallbackGame);
      return fallbackGame;
    }

    throw new Error("The game details API may be blocked by the browser/CORS, and this game is not available in the temporary fallback data.");
  }
}

export function getApiStatusMessage() {
  return apiStatusMessage;
}

function filterFallbackGames(filters) {
  let games = [...developmentFallbackGames];

  if (filters.platform) {
    games = games.filter((game) => game.platform.toLowerCase().includes(filters.platform.toLowerCase()));
  }

  if (filters.category) {
    games = games.filter((game) => game.genre.toLowerCase().includes(filters.category.toLowerCase()));
  }

  if (filters.sortBy === "release-date") {
    games.sort((firstGame, secondGame) => secondGame.release_date.localeCompare(firstGame.release_date));
  }

  if (filters.sortBy === "alphabetical") {
    games.sort((firstGame, secondGame) => firstGame.title.localeCompare(secondGame.title));
  }

  return games;
}
