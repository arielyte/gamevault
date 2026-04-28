# GameVault

GameVault is a vanilla HTML, CSS, and JavaScript school project for discovering free-to-play games.
It uses hash routing to show different views without any framework or build tool.

## Features

- Home, Browse Games, Categories, Favorites, and Game Details views
- Dynamic game cards rendered with JavaScript
- Search by title
- Filter by platform and category
- Sort with FreeToGame supported sort options
- Game details page for each selected game
- Save and remove favorites with LocalStorage
- Loading, error, and empty-results states
- Responsive layout for mobile, tablet, and desktop

## API Used

This project uses the FreeToGame API:

- API base URL: `https://www.freetogame.com/api`
- Games endpoint: `GET /games`
- Details endpoint: `GET /game?id={game_id}`

Game data is provided by
[FreeToGame](https://www.freetogame.com/).

Note: FreeToGame mentions that CORS support may require RapidAPI in some cases.
The API logic is isolated in `js/api.js` so the request setup can be adjusted later if needed.

During development, `js/api.js` includes a small temporary fallback list.
It is only used if the live API request fails, and it should not replace the final external API integration.

## How To Run

Because this project uses ES modules, run it through a simple local static server.
For example:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

You can also use a normal static server extension such as Live Server in VS Code.

## Project Structure

```text
gamevault/
├── index.html
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── api.js
│   ├── storage.js
│   ├── render.js
│   ├── router.js
│   └── app.js
└── assets/
```

## File Responsibilities

- `index.html` contains the page shell, semantic layout, navigation, and module script link.
- `css/style.css` contains the responsive dark dashboard design.
- `js/api.js` handles only FreeToGame API requests.
- `js/storage.js` handles only LocalStorage favorites.
- `js/render.js` creates HTML for states, cards, and views.
- `js/router.js` reads hash routes and updates active navigation links.
- `js/app.js` connects the API, router, rendering, filters, and favorites.

## Credits

- Game data and images: [FreeToGame](https://www.freetogame.com/)
- Built with vanilla HTML5, CSS3, and JavaScript ES6+
