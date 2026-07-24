// ============================================
// e-Calih v1.1
// admin.js
// Statistik Kabupaten + CRUD Admin
// ============================================

let dataPemilih = [];
let modeEdit = false;
let editId = "";
let chartKabupaten = null;

// ==============================
// START
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  // CEK LOGIN
  if (localStorage.getItem("ecalih_login") !== "true") {
    location.href = "index.html";

    return;
  }

  // LOAD DATA
  loadData();

  // LOGOUT
  document.getElementById("logoutBtn").onclick = logout;

  // SEARCH
  document.getElementById("searchInput").addEventListener("keyup", cariData);

  // TAMBAH DATA
  document.getElementById("addBtn").onclick = bukaTambah;

  // TUTUP MODAL
  document.getElementById("closeModal").onclick = tutupModal;

  // SIMPAN DATA
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

  // SIMPAN DATA
  dataPemilih = hasil.data;

  // TOTAL DATA
  document.getElementById("totalData").innerHTML = dataPemilih.length;

  // TAMPILKAN DATA
  tampilkanData(dataPemilih);

  // UPDATE STATISTIK
  buatStatistikKabupaten();
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

        <h3>
          ${item.nama}
        </h3>


        <p>
          <b>NIK :</b>
          ${item.nik}
        </p>


        <p>
          <b>RT :</b>
          ${item.rt}
        </p>


        <p>
          <b>RW :</b>
          ${item.rw}
        </p>


        <p>
          <b>Dusun :</b>
          ${item.dusun}
        </p>


        <p>
          <b>Desa :</b>
          ${item.desa}
        </p>


        <p>
          <b>Kecamatan :</b>
          ${item.kecamatan}
        </p>


        <p>
          <b>Kabupaten :</b>
          ${item.kabupaten}
        </p>


        <p>
          <b>Unsur :</b>
          ${item.unsur}
        </p>


        <div class="action">

          <button
            class="edit"
            onclick="editData('${item.id}')"
          >

            <i class="fa-solid fa-pen"></i>

            Edit

          </button>


          <button
            class="delete"
            onclick="hapusData('${item.id}')"
          >

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
// STATISTIK KABUPATEN
// ==============================

function buatStatistikKabupaten() {
  let nganjuk = 0;

  let kabMadiun = 0;

  let kotaMadiun = 0;

  // HITUNG DATA
  dataPemilih.forEach((item) => {
    const kabupaten = String(item.kabupaten || "")
      .trim()
      .toLowerCase();

    // NGANJUK
    if (kabupaten.includes("nganjuk")) {
      nganjuk++;
    }

    // KABUPATEN MADIUN
    else if (
      kabupaten === "kabupaten madiun" ||
      kabupaten === "kab. madiun" ||
      kabupaten === "kab madiun"
    ) {
      kabMadiun++;
    }

    // KOTA MADIUN
    else if (kabupaten === "kota madiun" || kabupaten === "madiun kota") {
      kotaMadiun++;
    }
  });

  // ==============================
  // UPDATE ANGKA
  // ==============================

  const nganjukElement = document.getElementById("nganjukTotal");

  const kabMadiunElement = document.getElementById("kabMadiunTotal");

  const kotaMadiunElement = document.getElementById("kotaMadiunTotal");

  if (nganjukElement) {
    nganjukElement.innerHTML = nganjuk;
  }

  if (kabMadiunElement) {
    kabMadiunElement.innerHTML = kabMadiun;
  }

  if (kotaMadiunElement) {
    kotaMadiunElement.innerHTML = kotaMadiun;
  }

  // ==============================
  // BUAT DIAGRAM
  // ==============================

  const canvas = document.getElementById("kabupatenChart");

  if (!canvas) {
    return;
  }

  // HAPUS CHART LAMA
  if (chartKabupaten) {
    chartKabupaten.destroy();
  }

  // BUAT CHART BARU
  chartKabupaten = new Chart(
    canvas,

    {
      type: "doughnut",

      data: {
        labels: ["Kabupaten Nganjuk", "Kabupaten Madiun", "Kota Madiun"],

        datasets: [
          {
            data: [nganjuk, kabMadiun, kotaMadiun],

            backgroundColor: ["#123d2a", "#1f6b48", "#81c784"],

            borderColor: "#ffffff",

            borderWidth: 3,

            hoverOffset: 8,
          },
        ],
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        cutout: "65%",

        plugins: {
          legend: {
            position: "bottom",

            labels: {
              padding: 20,

              usePointStyle: true,

              font: {
                family: "Poppins",

                size: 12,
              },
            },
          },

          tooltip: {
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce(
                  (a, b) => a + b,

                  0,
                );

                const value = context.raw;

                let percentage = 0;

                if (total > 0) {
                  percentage = ((value / total) * 100).toFixed(1);
                }

                return (
                  " " +
                  context.label +
                  ": " +
                  value +
                  " data (" +
                  percentage +
                  "%)"
                );
              },
            },
          },
        },
      },
    },
  );
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
  })

    .then((result) => {
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

  // ==============================
  // VALIDASI
  // ==============================

  for (const key in data) {
    if (key !== "id" && data[key] === "") {
      Swal.fire(
        "Peringatan",

        "Semua field wajib diisi.",

        "warning",
      );

      return;
    }
  }

  // ==============================
  // LOADING
  // ==============================

  Swal.fire({
    title: "Menyimpan...",

    allowOutsideClick: false,

    didOpen: () => {
      Swal.showLoading();
    },
  });

  let hasil;

  // ==============================
  // UPDATE
  // ==============================

  if (modeEdit) {
    hasil = await updateData(data);
  }

  // ==============================
  // INSERT
  // ==============================
  else {
    hasil = await insertData(data);
  }

  Swal.close();

  // ==============================
  // HASIL
  // ==============================

  if (hasil.status) {
    Swal.fire(
      "Berhasil",

      hasil.message,

      "success",
    );

    tutupModal();

    // LOAD ULANG DATA
    loadData();
  } else {
    Swal.fire(
      "Gagal",

      hasil.message,

      "error",
    );
  }
}

// ==============================
// EDIT DATA
// ==============================

function editData(id) {
  const item = dataPemilih.find((x) => x.id == id);

  if (!item) {
    return;
  }

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

  if (!konfirmasi.isConfirmed) {
    return;
  }

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
    Swal.fire(
      "Berhasil",

      hasil.message,

      "success",
    );

    // LOAD ULANG DATA
    // Statistik otomatis ikut diperbarui
    loadData();
  } else {
    Swal.fire(
      "Gagal",

      hasil.message,

      "error",
    );
  }
}

// ==============================
// END
// ==============================
