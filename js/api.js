// ======================================================
// e-Calih API
// ======================================================

// GANTI JIKA URL APPS SCRIPT BERUBAH
const BASE_URL =
  "https://script.google.com/macros/s/AKfycbwCOM98c26Fs1duDl8rEyoGU3foZYZ-cfFC4RmbkSq741hn35quBDj2SzFQnlX0d4nb_Q/exec";

// ==========================
// LOGIN ADMIN
// ==========================
async function loginAdmin(username, password) {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "login",
        username: username,
        password: password,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error(error);

    return {
      status: false,
      message: "Tidak dapat terhubung ke server.",
    };
  }
}

// ==========================
// AMBIL SEMUA DATA
// ==========================
async function getAllData() {
  try {
    const response = await fetch(BASE_URL + "?action=getAll");
    return await response.json();
  } catch (error) {
    console.error(error);

    return {
      status: false,
      data: [],
    };
  }
}

// ==========================
// SEARCH
// ==========================
async function searchData(keyword) {
  try {
    const response = await fetch(
      BASE_URL +
        "?action=search&keyword=" +
        encodeURIComponent(keyword)
    );

    return await response.json();
  } catch (error) {
    console.error(error);

    return {
      status: false,
      data: [],
    };
  }
}

// ==========================
// INSERT
// ==========================
async function insertData(data) {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "insert",
        ...data,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error(error);

    return {
      status: false,
      message: "Gagal menambahkan data.",
    };
  }
}

// ==========================
// UPDATE
// ==========================
async function updateData(data) {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "update",
        ...data,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error(error);

    return {
      status: false,
      message: "Gagal mengubah data.",
    };
  }
}

// ==========================
// DELETE
// ==========================
async function deleteData(id) {
  try {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "delete",
        id: id,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error(error);

    return {
      status: false,
      message: "Gagal menghapus data.",
    };
  }
}