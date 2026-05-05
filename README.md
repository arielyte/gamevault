# GameVault

Student name: Ariel Veitsman

GameVault is a responsive game discovery and deals vault. It uses live data from the CheapShark API so users can browse active discounted PC game deals, search and filter deals, open deal details, and save favorite deals in the browser.

The project uses vanilla HTML, CSS, and JavaScript only. It does not use frameworks, npm packages, build tools, or a backend server.

## Technologies Used

- HTML5 semantic structure
- CSS3 with Flexbox, Grid, and media queries
- Vanilla JavaScript ES6 modules
- `fetch` with `async/await`
- LocalStorage for favorites

## Features

- Separate Home, Browse Deals, Categories, Favorites, and Deal Details pages
- Dynamic deal cards rendered with JavaScript
- Search by title
- Filter by game store and maximum price
- Sort with CheapShark supported sort options
- Category/collection selection from the Categories page
- Details page with deal metadata, price comparison info, ratings, and favorites
- Save and remove favorite deals with LocalStorage
- Loading, error, and empty-results states
- Responsive layout for mobile, tablet, and desktop screens

## API Used

This project uses the CheapShark API because it works directly from browser `fetch`:

- API base URL: `https://www.cheapshark.com/api/1.0`
- Deals endpoint: `GET /deals`
- Deal details endpoint: `GET /deals?id={deal_id}`
- Stores endpoint: `GET /stores`

Game deal data is provided by
[CheapShark](https://www.cheapshark.com/).

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

## Pages and URLs

- `index.html` renders the Home page.
- `browse.html` renders Browse Deals.
- `categories.html` renders Categories.
- `favorites.html` renders Favorites.
- `details.html?id={dealID}` renders one CheapShark deal details page.

Browse filters use normal query parameters, for example:

```text
browse.html?search=doom&storeID=1&maxPrice=10&sortBy=Price
```

## Project Structure

```text
gamevault/
├── index.html
├── browse.html
├── categories.html
├── favorites.html
├── details.html
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
    ├── blue-galaxy-wallpaper.webp
    ├── cat.jpg
    ├── favicon.png
    └── placeholder.png
```

## File Responsibilities

- `index.html`, `browse.html`, `categories.html`, `favorites.html`, and `details.html` contain the separate semantic page shells.
- `css/style.css` contains the responsive dark dashboard design.
- `js/api.js` handles only CheapShark API requests.
- `js/storage.js` handles only LocalStorage favorites.
- `js/render.js` creates HTML for states, cards, and page content.
- `js/router.js` provides small page, query string, deal ID, and active navigation helpers for the multi-page setup.
- `js/app.js` detects the current page, connects the API, rendering, filters, and favorites.

## Credits

- Game deal data and images: [CheapShark](https://www.cheapshark.com/)
- Built with vanilla HTML5, CSS3, and JavaScript ES6+

## Submission Checklist

- [X] Site opens without console errors
- [X] CheapShark API loads live deal data
- [X] Loading, error, and empty-results states exist
- [X] Responsive on mobile, tablet, and desktop
- [X] At least 4 separate HTML pages are present
- [X] README is complete
- [X] Code is organized into `/css`, `/js`, and `/assets`
- [X] No frameworks, build tools, API keys, or backend are used
