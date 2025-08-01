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

  fetch("http://localhost:3000/films/actors")
    .then(res => res.json())
    .then(actors => {
      window.allActors = actors;
    })
    .catch(err => console.error("Aktörler çekilemedi:", err));

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

  // Tür dropdown butonu için açma-kapama
  const genreDropdownBtn = document.getElementById("genreDropdownBtn");
  const genreCheckboxes = document.getElementById("genreCheckboxes");

  genreDropdownBtn.addEventListener("click", () => {
    if (genreCheckboxes.style.display === "none" || genreCheckboxes.style.display === "") {
      genreCheckboxes.style.display = "flex";
    } else {
      genreCheckboxes.style.display = "none";
    }
  });
});

const filmsPerPage = 10;
let currentPage = 1;
let allFilms = [];
let filteredFilms = [];

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

  // Tür checkboxlarından seçilenleri alıyoruz
  const genreCheckboxes = document.querySelectorAll("#genreCheckboxes input[type='checkbox']");
  const selectedGenres = Array.from(genreCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value.toLowerCase());

  const year = document.getElementById("filterYear").value;
  const director = document.getElementById("filterDirector").value.toLowerCase();
  const rating = parseFloat(document.getElementById("filterRating").value);
  const actorName = document.getElementById("filterActor").value.trim().toLowerCase();

  let filtered = allFilms.filter((film) => {
    const matchesSearch = film.title.toLowerCase().includes(searchQuery);

    const filmGenres = film.genre.toLowerCase().split(",").map(g => g.trim());
    const matchesGenre = selectedGenres.length > 0
      ? selectedGenres.some(g => filmGenres.includes(g))
      : true;

    const matchesYear = year ? film.releaseYear == year : true;
    const matchesDirector = director ? film.director.toLowerCase().includes(director) : true;
    const matchesRating = !isNaN(rating) ? parseFloat(film.imdbRating) >= rating : true;

    // Actor filter logic
    let matchesActor = true;
    if (actorName) {
      // Find actor(s) by partial name (case-insensitive)
      const matchedActors = window.allActors?.filter(a => a.name.toLowerCase().includes(actorName));
      if (matchedActors && matchedActors.length > 0) {
        // Check if filmActors includes any of these actor ids
        matchesActor = film.filmActors?.some(fa => matchedActors.some(actor => actor.id === fa.actor_id));
      } else {
        matchesActor = false;
      }
    }

    return matchesSearch && matchesGenre && matchesYear && matchesDirector && matchesRating && matchesActor;
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
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      displayFilms();
      displayPagination();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    pagination.appendChild(btn);
  }
}
