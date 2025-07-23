document.addEventListener("DOMContentLoaded", () => {
  const userInfo = document.getElementById("userInfo");

  const user = {
    username: localStorage.getItem("username") || "Kullanıcı",
    email: localStorage.getItem("email") || "ornek@mail.com",
  };

  userInfo.innerHTML = `
    <strong>${user.username}</strong><br />
    <small>${user.email}</small>
  `;

  fetchFilms();

  document.getElementById("searchInput").addEventListener("input", () => {
    currentPage = 1;
    displayFilms();
    displayPagination();
  });

  document.getElementById("filterBtn").addEventListener("click", () => {
    const menu = document.getElementById("filterMenu");
    menu.style.display = menu.style.display === "none" ? "flex" : "none";
  });

  document.getElementById("applyFilters").addEventListener("click", () => {
    currentPage = 1;
    displayFilms();
    displayPagination();
  });
});

const filmsPerPage = 10;
let currentPage = 1;
let allFilms = [];

async function fetchFilms() {
  try {
    const res = await fetch("http://localhost:3000/films");
    if (!res.ok) throw new Error("Filmler çekilemedi");

    const data = await res.json();
    allFilms = data;
    displayFilms();
    displayPagination();
  } catch (error) {
    console.error(error);
  }
}

function displayFilms() {
  const searchQuery = document.getElementById("searchInput").value.toLowerCase();

  // Çoklu tür seçimi
  const genreSelect = document.getElementById("filterGenre");
  const selectedGenres = Array.from(genreSelect.selectedOptions).map(opt => opt.value.toLowerCase());

  const year = document.getElementById("filterYear").value;
  const director = document.getElementById("filterDirector").value.toLowerCase();
  const rating = parseFloat(document.getElementById("filterRating").value);

  let filtered = allFilms.filter((film) => {
    const matchesSearch = film.title.toLowerCase().includes(searchQuery);

    // Film birden fazla türe sahipse, burada virgülle ayırıp kontrol edebilirsin
    const filmGenres = film.genre.toLowerCase().split(",").map(g => g.trim());
    const matchesGenre = selectedGenres.length > 0
      ? selectedGenres.some(g => filmGenres.includes(g))
      : true;

    const matchesYear = year ? film.releaseYear == year : true;
    const matchesDirector = director ? film.director.toLowerCase().includes(director) : true;
    const matchesRating = !isNaN(rating) ? parseFloat(film.imdbRating) >= rating : true;

    return matchesSearch && matchesGenre && matchesYear && matchesDirector && matchesRating;
  });

  const start = (currentPage - 1) * filmsPerPage;
  const end = start + filmsPerPage;
  const currentFilms = filtered.slice(start, end);

  const container = document.getElementById("filmsContainer");
  container.innerHTML = "";

  currentFilms.forEach(film => {
    const card = document.createElement("div");
    card.className = "film-card";
    card.innerHTML = `
      <img src="${film.posterUrl}" alt="${film.title}" />
      <div class="title">${film.title}</div>
    `;
    container.appendChild(card);
  });

  if (currentFilms.length === 0) {
    container.innerHTML = `<p style="padding: 1rem; font-size: 1.2rem;">Filtrelere uyan film bulunamadı.</p>`;
  }

  filteredFilms = filtered;
}

function displayPagination() {
  const pageCount = Math.ceil(filteredFilms.length / filmsPerPage);
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  if (pageCount <= 1) return;

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.style.backgroundColor = "#2c3e50";
    btn.addEventListener("click", () => {
      currentPage = i;
      displayFilms();
      displayPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    pagination.appendChild(btn);
  }
}
