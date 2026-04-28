const FAVORITES_KEY = "gamevault-favorites";

export function getFavorites() {
  const savedFavorites = localStorage.getItem(FAVORITES_KEY);

  if (!savedFavorites) {
    return [];
  }

  try {
    return JSON.parse(savedFavorites);
  } catch (error) {
    return [];
  }
}

export function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(gameId) {
  return getFavorites().some((game) => String(game.id) === String(gameId));
}

export function addFavorite(game) {
  const favorites = getFavorites();
  const alreadySaved = favorites.some((favorite) => favorite.id === game.id);

  if (!alreadySaved) {
    favorites.push(game);
    saveFavorites(favorites);
  }
}

export function removeFavorite(gameId) {
  const favorites = getFavorites().filter((game) => String(game.id) !== String(gameId));
  saveFavorites(favorites);
}
