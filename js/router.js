export function getRoute() {
  const hash = window.location.hash || "#/home";
  const [path, queryString = ""] = hash.slice(1).split("?");
  const parts = path.split("/").filter(Boolean);
  const page = parts[0] || "home";
  const id = parts[1] || "";
  const query = new URLSearchParams(queryString);

  return { page, id, query };
}

export function setActiveNav(page) {
  const navLinks = document.querySelectorAll("[data-nav-link]");

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href").replace("#/", "");
    link.classList.toggle("active", linkPage === page);
  });
}

export function startRouter(renderCurrentRoute) {
  window.addEventListener("hashchange", renderCurrentRoute);

  if (!window.location.hash) {
    window.location.hash = "#/home";
    return;
  }

  renderCurrentRoute();
}
