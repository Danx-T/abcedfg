const apiBaseUrl = 'http://localhost:3000/auth';

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
const sendForgotEmailBtn = document.getElementById('sendForgotEmailBtn');

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

    // 🔐 Token ve kullanıcı bilgilerini sakla
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('username', data.user.username);
    localStorage.setItem('email', data.user.email);

    // ✅ Başarılı girişten sonra dashboard'a yönlendir
    window.location.href = 'dashboard/dashboard.html';

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

// 🔐 Şifremi Unuttum modalını aç
forgotPasswordBtn.addEventListener('click', () => {
  document.getElementById('forgotPasswordModal').style.display = 'block';
});

// 🔐 Modalı kapat
function closeForgotModal() {
  document.getElementById('forgotPasswordModal').style.display = 'none';
}

// 🔐 Mail gönder
sendForgotEmailBtn.addEventListener('click', async () => {
  const email = document.getElementById('forgotEmailInput').value;

  if (!email) {
    alert("Lütfen bir e-posta adresi girin.");
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("📩 Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.");
      closeForgotModal();
    } else {
      alert(data.message || "Bir hata oluştu.");
    }
  } catch (err) {
    console.error("❌ Sunucu hatası:", err);
    alert("Sunucuya bağlanırken bir hata oluştu.");
  }
});
