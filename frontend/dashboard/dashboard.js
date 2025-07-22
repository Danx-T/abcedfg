// Kullanıcı bilgilerini gösterme (mevcut kodun)
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
});

const filmsPerPage = 10;
let currentPage = 1;
let allFilms = [];

async function fetchFilms() {
  try {
    const res = await fetch('http://localhost:3000/films'); // backend adresin
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
  const start = (currentPage - 1) * filmsPerPage;
  const end = start + filmsPerPage;
  const currentFilms = allFilms.slice(start, end);

  const container = document.getElementById('filmsContainer');
  container.innerHTML = '';

  currentFilms.forEach(film => {
    const card = document.createElement('div');
    card.className = 'film-card';
    card.innerHTML = `
      <img src="${film.posterUrl}" alt="${film.title}" />
      <div class="title">${film.title}</div>
    `;
    container.appendChild(card);
  });
}

function displayPagination() {
  const pageCount = Math.ceil(allFilms.length / filmsPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';

  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === currentPage) btn.style.backgroundColor = '#2c3e50';
    btn.addEventListener('click', () => {
      currentPage = i;
      displayFilms();
      displayPagination();
      // Scroll'u başa alalım sayfa değişince
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    pagination.appendChild(btn);
  }
}
