// ============================================
// e-Calih v1.0
// admin.js
// PART 1
// ============================================

let dataPemilih = [];
let modeEdit = false;
let editId = "";

// ==============================
// START
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("ecalih_login") !== "true") {
    location.href = "index.html";
    return;
  }

  loadData();

  document.getElementById("logoutBtn").onclick = logout;

  document.getElementById("searchInput").addEventListener("keyup", cariData);

  document.getElementById("addBtn").onclick = bukaTambah;

  document.getElementById("closeModal").onclick = tutupModal;

  document.getElementById("saveBtn").onclick = simpanData;
});

// ==============================
// LOAD DATA
// ==============================

async function loadData() {
  Swal.fire({
    title: "Memuat Data...",
    allowOutsideClick: false,

    didOpen: () => {
      Swal.showLoading();
    },
  });

  const hasil = await getAllData();

  Swal.close();

  if (!hasil.status) {
    Swal.fire("Error", "Tidak bisa mengambil data", "error");

    return;
  }

  dataPemilih = hasil.data;

  document.getElementById("totalData").innerHTML = dataPemilih.length;

  tampilkanData(dataPemilih);
}

// ==============================
// TAMPILKAN DATA
// ==============================

function tampilkanData(data) {
  const list = document.getElementById("dataList");

  list.innerHTML = "";

  if (data.length == 0) {
    list.innerHTML = `

        <div class="empty">

            Tidak ada data.

        </div>

        `;

    return;
  }

  data.forEach((item) => {
    list.innerHTML += `

<div class="card-data">

<h3>${item.nama}</h3>

<p><b>NIK :</b> ${item.nik}</p>

<p><b>RT :</b> ${item.rt}</p>

<p><b>RW :</b> ${item.rw}</p>

<p><b>Dusun :</b> ${item.dusun}</p>

<p><b>Desa :</b> ${item.desa}</p>

<p><b>Kecamatan :</b> ${item.kecamatan}</p>

<p><b>Kabupaten :</b> ${item.kabupaten}</p>

<p><b>Unsur :</b> ${item.unsur}</p>

<div class="action">

<button class="edit"
onclick="editData('${item.id}')">

<i class="fa-solid fa-pen"></i>

Edit

</button>

<button class="delete"
onclick="hapusData('${item.id}')">

<i class="fa-solid fa-trash"></i>

Hapus

</button>

</div>

</div>

`;
  });
}

// ==============================
// SEARCH
// ==============================

function cariData() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();

  const hasil = dataPemilih.filter(
    (item) =>
      item.nama.toLowerCase().includes(keyword) ||
      item.nik.toLowerCase().includes(keyword),
  );

  tampilkanData(hasil);
}

// ==============================
// MODAL
// ==============================

function bukaTambah() {
  modeEdit = false;

  editId = "";

  document.getElementById("modalTitle").innerHTML = "Tambah Data";

  bersihkanForm();

  document.getElementById("modalForm").classList.add("show");
}

function tutupModal() {
  document.getElementById("modalForm").classList.remove("show");
}

window.onclick = function (e) {
  const modal = document.getElementById("modalForm");

  if (e.target == modal) {
    tutupModal();
  }
};

// ==============================
// BERSIHKAN FORM
// ==============================

function bersihkanForm() {
  document.getElementById("id").value = "";

  document.getElementById("nama").value = "";

  document.getElementById("nik").value = "";

  document.getElementById("rt").value = "";

  document.getElementById("rw").value = "";

  document.getElementById("dusun").value = "";

  document.getElementById("desa").value = "";

  document.getElementById("kecamatan").value = "";

  document.getElementById("kabupaten").value = "";

  document.getElementById("unsur").value = "";
}

// ==============================
// LOGOUT
// ==============================

function logout() {
  Swal.fire({
    title: "Logout ?",

    icon: "question",

    showCancelButton: true,

    confirmButtonText: "Ya",

    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("ecalih_login");

      localStorage.removeItem("ecalih_username");

      location.href = "index.html";
    }
  });
}

// ==============================
// SIMPAN DATA
// ==============================

async function simpanData() {
  const data = {
    id: editId,
    nama: document.getElementById("nama").value.trim(),
    nik: document.getElementById("nik").value.trim(),
    rt: document.getElementById("rt").value.trim(),
    rw: document.getElementById("rw").value.trim(),
    dusun: document.getElementById("dusun").value.trim(),
    desa: document.getElementById("desa").value.trim(),
    kecamatan: document.getElementById("kecamatan").value.trim(),
    kabupaten: document.getElementById("kabupaten").value.trim(),
    unsur: document.getElementById("unsur").value.trim(),
  };

  // Validasi
  for (const key in data) {
    if (key !== "id" && data[key] === "") {
      Swal.fire("Peringatan", "Semua field wajib diisi.", "warning");

      return;
    }
  }

  Swal.fire({
    title: "Menyimpan...",
    allowOutsideClick: false,

    didOpen: () => {
      Swal.showLoading();
    },
  });

  let hasil;

  if (modeEdit) {
    hasil = await updateData(data);
  } else {
    hasil = await insertData(data);
  }

  Swal.close();

  if (hasil.status) {
    Swal.fire("Berhasil", hasil.message, "success");

    tutupModal();

    loadData();
  } else {
    Swal.fire("Gagal", hasil.message, "error");
  }
}

// ==============================
// EDIT DATA
// ==============================

function editData(id) {
  const item = dataPemilih.find((x) => x.id == id);

  if (!item) return;

  modeEdit = true;

  editId = item.id;

  document.getElementById("modalTitle").innerHTML = "Edit Data";

  document.getElementById("id").value = item.id;
  document.getElementById("nama").value = item.nama;
  document.getElementById("nik").value = item.nik;
  document.getElementById("rt").value = item.rt;
  document.getElementById("rw").value = item.rw;
  document.getElementById("dusun").value = item.dusun;
  document.getElementById("desa").value = item.desa;
  document.getElementById("kecamatan").value = item.kecamatan;
  document.getElementById("kabupaten").value = item.kabupaten;
  document.getElementById("unsur").value = item.unsur;

  document.getElementById("modalForm").classList.add("show");
}

// ==============================
// HAPUS DATA
// ==============================

async function hapusData(id) {
  const konfirmasi = await Swal.fire({
    title: "Hapus Data?",

    text: "Data yang dihapus tidak bisa dikembalikan.",

    icon: "warning",

    showCancelButton: true,

    confirmButtonText: "Hapus",

    cancelButtonText: "Batal",
  });

  if (!konfirmasi.isConfirmed) return;

  Swal.fire({
    title: "Menghapus...",

    allowOutsideClick: false,

    didOpen: () => {
      Swal.showLoading();
    },
  });

  const hasil = await deleteData(id);

  Swal.close();

  if (hasil.status) {
    Swal.fire("Berhasil", hasil.message, "success");

    loadData();
  } else {
    Swal.fire("Gagal", hasil.message, "error");
  }
}

// ==============================
// END
// ==============================
