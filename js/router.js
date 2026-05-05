const PAGE_BY_FILE = {
  "": "home",
  "index.html": "home",
  "browse.html": "browse",
  "categories.html": "categories",
  "favorites.html": "favorites",
  "details.html": "details"
};

export function getCurrentPage() {
  const bodyPage = document.body.dataset.page;

  if (bodyPage) {
    return bodyPage;
  }

  const fileName = window.location.pathname.split("/").pop();

  return PAGE_BY_FILE[fileName] || "home";
}

export function getQueryParams() {
  return new URLSearchParams(window.location.search);
}

export function getDealId(query = getQueryParams()) {
  return query.get("id") || "";
}

export function setActiveNav(page) {
  const navLinks = document.querySelectorAll("[data-nav-link]");

  navLinks.forEach((link) => {
    const linkPage = link.dataset.navLink;
    link.classList.toggle("active", linkPage === page);
  });
}
