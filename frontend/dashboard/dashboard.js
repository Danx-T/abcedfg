// Kullanıcı bilgilerini gösterme
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

  // Filmleri çek ve göster
  fetchFilms();

  // Arama kutusu dinlemesi
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", () => {
    currentPage = 1;
    filterAndDisplayFilms(searchInput.value);
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
    filteredFilms = allFilms; // başlangıçta tüm filmler gösterilir
    displayFilms();
    displayPagination();
  } catch (error) {
    console.error(error);
  }
}

function filterAndDisplayFilms(searchTerm) {
  const term = searchTerm.trim().toLowerCase();
  if (term === "") {
    filteredFilms = allFilms;
  } else {
    filteredFilms = allFilms.filter(film =>
      film.title.toLowerCase().includes(term)
    );
  }
  displayFilms();
  displayPagination();
}

function displayFilms() {
  const start = (currentPage - 1) * filmsPerPage;
  const end = start + filmsPerPage;
  const currentFilms = filteredFilms.slice(start, end);

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
    container.innerHTML = `<p style="padding: 1rem; font-size: 1.2rem;">Aramaya uygun film bulunamadı.</p>`;
  }
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
