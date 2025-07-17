// Kullanıcı bilgilerini örnek olarak localStorage'dan alıyoruz
// Gerçek projede bu bilgileri backend'den JWT ile çözümleyip alırsın

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
});
