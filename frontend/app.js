const apiBaseUrl = 'http://localhost:3000/auth';

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const logoutBtn = document.getElementById('logoutBtn');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

// 🚪 Giriş
loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await fetch(`${apiBaseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error('Giriş başarısız');
    const data = await res.json();
    localStorage.setItem('accessToken', data.access_token);
    alert('Giriş başarılı!');
    logoutBtn.style.display = 'inline';
  } catch (err) {
    alert(err.message);
  }
});

// 🆕 Kayıt
registerForm.addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  const firstName = document.getElementById('registerFirstName').value;
  const lastName = document.getElementById('registerLastName').value;

  try {
    const res = await fetch(`${apiBaseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password, firstName, lastName }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Kayıt başarısız');
    }
    alert('Kayıt başarılı! Giriş yapabilirsiniz.');
    registerForm.reset();
  } catch (err) {
    alert(err.message);
  }
});

// 🚪 Çıkış
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('accessToken');
  alert('Çıkış yapıldı!');
  logoutBtn.style.display = 'none';
});

// 🔐 Şifremi Unuttum
forgotPasswordBtn.addEventListener('click', async () => {
  const email = prompt("Şifreni sıfırlamak için e-posta adresini gir:");

  if (!email) return;

  try {
    const response = await fetch(`${apiBaseUrl}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Şifre sıfırlama bağlantısı email adresine gönderildi.");
      console.log("📩 Reset token backend log'unda olacak.");
    } else {
      alert(data.message || "Bir hata oluştu.");
    }
  } catch (err) {
    console.error("❌ İstek sırasında hata:", err);
    alert("Sunucuya bağlanırken hata oluştu.");
  }
});
