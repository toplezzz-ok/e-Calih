// =======================================
// e-Calih Login
// =======================================

document.addEventListener("DOMContentLoaded", () => {
  // Kalau admin sudah login langsung ke dashboard
  if (localStorage.getItem("ecalih_login") === "true") {
    window.location.href = "admin.html";
    return;
  }

  // Tombol Login
  document.getElementById("loginBtn").addEventListener("click", login);

  // Tombol User
  document.getElementById("userBtn").addEventListener("click", () => {
    window.location.href = "user.html";
  });
});

// =======================================
// LOGIN
// =======================================

async function login() {
  const username = document.getElementById("username").value.trim();

  const password = document.getElementById("password").value.trim();

  if (username === "" || password === "") {
    Swal.fire({
      icon: "warning",
      title: "Oops...",
      text: "Username dan Password wajib diisi.",
    });

    return;
  }

  Swal.fire({
    title: "Sedang Login...",
    text: "Mohon tunggu",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });

  const result = await loginAdmin(username, password);

  Swal.close();

  if (result.status) {
    localStorage.setItem("ecalih_login", "true");
    localStorage.setItem("ecalih_username", username);

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Login Berhasil",

      timer: 1200,

      showConfirmButton: false,
    });

    setTimeout(() => {
      window.location.href = "admin.html";
    }, 1200);
  } else {
    Swal.fire({
      icon: "error",
      title: "Login Gagal",
      text: result.message,
    });
  }
}
