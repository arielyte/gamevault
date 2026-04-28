# GameVault

GameVault is a vanilla HTML, CSS, and JavaScript school project for discovering live PC game deals.
It uses hash routing to show different views without any framework or build tool.

## Features

- Home, Browse Deals, Collections, Favorites, and Deal Details views
- Dynamic deal cards rendered with JavaScript
- Search by title
- Filter by game store and maximum price
- Sort with CheapShark supported sort options
- Deal details page for each selected game
- Save and remove favorite deals with LocalStorage
- Loading, error, and empty-results states
- Responsive layout for mobile, tablet, and desktop

## API Used

This project uses the CheapShark API because it works directly from browser `fetch`:

- API base URL: `https://www.cheapshark.com/api/1.0`
- Deals endpoint: `GET /deals`
- Deal details endpoint: `GET /deals?id={deal_id}`

Game deal data is provided by
[CheapShark](https://www.cheapshark.com/).

The first version used FreeToGame, but direct browser requests to `https://www.freetogame.com/api/games`
did not include an `access-control-allow-origin` response header during testing.
That means Live Server browser requests can be blocked by CORS even though the endpoint exists.

The project uses Option B: CheapShark directly from the browser with no secret key or backend.

During development, `js/api.js` includes a tiny temporary backup list.
It is only used if the live CheapShark API request fails, and it should not replace the real external API integration.

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

- `index.html` contains the page shell, semantic layout, navigation, favicon, and module script link.
- `css/style.css` contains the responsive dark dashboard design.
- `js/api.js` handles only CheapShark API requests.
- `js/storage.js` handles only LocalStorage favorites.
- `js/render.js` creates HTML for states, cards, and views.
- `js/router.js` reads hash routes and updates active navigation links.
- `js/app.js` connects the API, router, rendering, filters, and favorites.

## Credits

- Game deal data and images: [CheapShark](https://www.cheapshark.com/)
- Built with vanilla HTML5, CSS3, and JavaScript ES6+
