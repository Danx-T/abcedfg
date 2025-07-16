const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

const resetBtn = document.getElementById('resetBtn');
const errorMsg = document.getElementById('errorMsg');
const successMsg = document.getElementById('successMsg');

resetBtn.addEventListener('click', async () => {
  // Mesajları gizle
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  // Inputları al
  const newPassword = document.getElementById('newPassword').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();

  // Validation kontrolleri
  if (!newPassword || !confirmPassword) {
    errorMsg.textContent = 'Lütfen tüm alanları doldurun.';
    errorMsg.style.display = 'block';
    return;
  }

  if (newPassword.length < 6) {
    errorMsg.textContent = 'Şifre en az 6 karakter olmalıdır.';
    errorMsg.style.display = 'block';
    return;
  }

  if (newPassword !== confirmPassword) {
    errorMsg.textContent = 'Şifreler uyuşmuyor.';
    errorMsg.style.display = 'block';
    return;
  }

  if (!token) {
    errorMsg.textContent = 'Geçersiz veya eksik token.';
    errorMsg.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      successMsg.textContent = data.message || 'Şifre başarıyla değiştirildi.';
      successMsg.style.display = 'block';

      // 3 saniye sonra index.html'ye yönlendir
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 3000);
    } else {
      errorMsg.textContent = data.message || 'Bir hata oluştu.';
      errorMsg.style.display = 'block';
    }
  } catch (err) {
    errorMsg.textContent = 'Sunucu ile bağlantı kurulamadı.';
    errorMsg.style.display = 'block';
  }
});
