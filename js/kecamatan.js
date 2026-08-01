// ======================================================
// e-Calih v1.5
// KECAMATAN.JS
// Statistik Kecamatan
// Total Pemilih Kabupaten
// No HP
// Tambah / Edit / Hapus Data
// ======================================================

let dataPemilih = [];

let namaKabupatenAktif = "";

let namaKecamatanAktif = "";

let kecamatanChart = null;

let modeEditKecamatan = false;

let editIdKecamatan = "";

// ======================================================
// DAFTAR KECAMATAN
// ======================================================

const daftarKecamatan = {
  "Kabupaten Nganjuk": [
    "Bagor",
    "Baron",
    "Berbek",
    "Gondang",
    "Jatikalen",
    "Kertosono",
    "Lengkong",
    "Loceret",
    "Nganjuk",
    "Ngetos",
    "Ngluyu",
    "Ngronggot",
    "Pace",
    "Patianrowo",
    "Prambon",
    "Rejoso",
    "Sawahan",
    "Sukomoro",
    "Tanjunganom",
    "Wilangan",
  ],

  "Kabupaten Madiun": [
    "Kebonsari",
    "Geger",
    "Dolopo",
    "Dagangan",
    "Wungu",
    "Kare",
    "Gemarang",
    "Saradan",
    "Pilangkenceng",
    "Mejayan",
    "Wonoasri",
    "Balerejo",
    "Madiun",
    "Sawahan",
    "Jiwan",
  ],

  "Kota Madiun": ["Kartoharjo", "Manguharjo", "Taman"],
};

// ======================================================
// START
// ======================================================

document.addEventListener("DOMContentLoaded", async () => {
  // ====================================================
  // AMBIL KABUPATEN
  // ====================================================

  namaKabupatenAktif = sessionStorage.getItem("ecalih_kabupaten");

  console.log("Kabupaten aktif:", namaKabupatenAktif);

  // ====================================================
  // CEK KABUPATEN
  // ====================================================

  if (!namaKabupatenAktif) {
    Swal.fire("Informasi", "Kabupaten tidak ditemukan.", "warning").then(() => {
      window.location.href = "admin.html";
    });

    return;
  }

  // ====================================================
  // TAMPILKAN NAMA KABUPATEN
  // ====================================================

  const namaKabupatenElement = document.getElementById("namaKabupaten");

  if (namaKabupatenElement) {
    namaKabupatenElement.innerText = namaKabupatenAktif;
  }

  // ====================================================
  // TOMBOL KEMBALI KE ADMIN
  // ====================================================

  const backBtn = document.getElementById("backBtn");

  if (backBtn) {
    backBtn.onclick = () => {
      window.location.href = "admin.html";
    };
  }

  // ====================================================
  // TOMBOL TUTUP DATA KECAMATAN
  // ====================================================

  const closeDataBtn = document.getElementById("closeDataBtn");

  if (closeDataBtn) {
    closeDataBtn.onclick = tutupDataKecamatan;
  }

  // ====================================================
  // SEARCH
  // ====================================================

  const searchInput = document.getElementById("searchKecamatan");

  if (searchInput) {
    searchInput.addEventListener("keyup", cariDataKecamatan);
  }

  // ====================================================
  // TOMBOL TAMBAH DATA
  // ====================================================

  const addBtn = document.getElementById("addKecamatanBtn");

  if (addBtn) {
    addBtn.onclick = bukaTambahKecamatan;
  }

  // ====================================================
  // TOMBOL TUTUP MODAL
  // ====================================================

  const closeModal = document.getElementById("closeKecamatanModal");

  if (closeModal) {
    closeModal.onclick = tutupModalKecamatan;
  }

  // ====================================================
  // TOMBOL SIMPAN
  // ====================================================

  const saveBtn = document.getElementById("saveKecamatanBtn");

  if (saveBtn) {
    saveBtn.onclick = simpanDataKecamatan;
  }

  // ====================================================
  // LOAD DATA
  // ====================================================

  await loadData();
});

// ======================================================
// LOAD DATA
// ======================================================

async function loadData() {
  try {
    Swal.fire({
      title: "Memuat Data...",

      text: "Mengambil data dari database",

      allowOutsideClick: false,

      didOpen: () => {
        Swal.showLoading();
      },
    });

    // ==================================================
    // AMBIL DATA
    // ==================================================

    const hasil = await getAllData();

    Swal.close();

    // ==================================================
    // CEK HASIL
    // ==================================================

    if (!hasil || !hasil.status) {
      Swal.fire("Error", "Terjadi kesalahan saat mengambil data.", "error");

      return;
    }

    // ==================================================
    // SIMPAN DATA
    // ==================================================

    dataPemilih = hasil.data || [];

    console.log("Total semua data:", dataPemilih.length);

    // ==================================================
    // TOTAL KABUPATEN
    // ==================================================

    const totalKabupaten = hitungTotalKabupaten();

    const totalElement = document.getElementById("totalKabupaten");

    if (totalElement) {
      totalElement.innerText = totalKabupaten;
    }

    // ==================================================
    // TAMPILKAN KECAMATAN
    // ==================================================

    tampilkanKecamatan();

    // ==================================================
    // JIKA SEDANG MEMBUKA KECAMATAN
    // REFRESH DATA
    // ==================================================

    if (namaKecamatanAktif) {
      tampilkanDataKecamatan(namaKecamatanAktif);
    }
  } catch (error) {
    console.error("ERROR LOAD DATA:", error);

    Swal.close();

    Swal.fire("Error", "Terjadi kesalahan saat mengambil data.", "error");
  }
}

// ======================================================
// TAMPILKAN KECAMATAN
// ======================================================

function tampilkanKecamatan() {
  const container = document.getElementById("kecamatanStats");

  if (!container) {
    console.error("Element kecamatanStats tidak ditemukan");

    return;
  }

  container.innerHTML = "";

  const daftar = daftarKecamatan[namaKabupatenAktif];

  if (!daftar) {
    container.innerHTML = `

      <div class="empty">

        Data kecamatan belum tersedia.

      </div>

    `;

    return;
  }

  const labels = [];

  const values = [];

  // ==================================================
  // BUAT CARD KECAMATAN
  // ==================================================

  daftar.forEach((namaKecamatan) => {
    const jumlah = hitungDataKecamatan(namaKecamatan);

    labels.push(namaKecamatan);

    values.push(jumlah);

    const card = document.createElement("div");

    card.className = "kabupaten-box kecamatan-box";

    card.style.cursor = "pointer";

    card.innerHTML = `

        <div class="kabupaten-icon">

          <i class="fa-solid fa-location-dot"></i>

        </div>

        <div class="kecamatan-card-text">

          <h4>
            Kecamatan ${namaKecamatan}
          </h4>

          <h2>
            ${jumlah}
          </h2>

          <span>
            Data Pemilih
          </span>

        </div>

        <div class="kabupaten-arrow">

          <i class="fa-solid fa-chevron-right"></i>

        </div>

      `;

    card.addEventListener("click", () => {
      bukaDataKecamatan(namaKecamatan);
    });

    container.appendChild(card);
  });

  updateChart(labels, values);
}

// ======================================================
// NORMALISASI
// ======================================================

function normalisasi(text) {
  if (text === null || text === undefined) {
    return "";
  }

  return text.toString().trim().toLowerCase();
}

// ======================================================
// CEK KABUPATEN
// ======================================================

function cocokKabupaten(nilaiKabupaten) {
  const kabupaten = normalisasi(nilaiKabupaten);

  const aktif = normalisasi(namaKabupatenAktif);

  if (aktif === "kabupaten nganjuk") {
    return kabupaten === "nganjuk" || kabupaten === "kabupaten nganjuk";
  }

  if (aktif === "kabupaten madiun") {
    return kabupaten === "madiun" || kabupaten === "kabupaten madiun";
  }

  if (aktif === "kota madiun") {
    return kabupaten === "kota madiun";
  }

  return false;
}

// ======================================================
// HITUNG DATA KECAMATAN
// ======================================================

function hitungDataKecamatan(namaKecamatan) {
  let jumlah = 0;

  dataPemilih.forEach((item) => {
    const cocokKab = cocokKabupaten(item.kabupaten);

    const cocokKec = normalisasi(item.kecamatan) === normalisasi(namaKecamatan);

    if (cocokKab && cocokKec) {
      jumlah++;
    }
  });

  return jumlah;
}

// ======================================================
// HITUNG TOTAL PEMILIH KABUPATEN
// ======================================================

function hitungTotalKabupaten() {
  let total = 0;

  dataPemilih.forEach((item) => {
    if (cocokKabupaten(item.kabupaten)) {
      total++;
    }
  });

  return total;
}

// ======================================================
// CHART
// ======================================================

function updateChart(labels, values) {
  const canvas = document.getElementById("kecamatanChart");

  if (!canvas) {
    return;
  }

  if (kecamatanChart) {
    kecamatanChart.destroy();
  }

  if (typeof Chart === "undefined") {
    return;
  }

  kecamatanChart = new Chart(canvas, {
    type: "doughnut",

    data: {
      labels: labels,

      datasets: [
        {
          data: values,

          backgroundColor: [
            "#1f4d36",
            "#286546",
            "#3c7a57",
            "#4f8967",
            "#629877",
            "#74a987",
            "#86b997",
            "#98c8a7",
            "#a9d6b7",
            "#b9dfc5",
            "#c9e7d2",
            "#d8eee0",
            "#e5f3e9",
            "#edf7f0",
            "#f3faf5",
            "#d1e5d8",
            "#b7d3c1",
            "#9fc1ab",
            "#87af95",
            "#6f9d7f",
          ],

          borderWidth: 2,

          borderColor: "#ffffff",
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      plugins: {
        legend: {
          position: "bottom",
        },

        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";

              const value = context.raw || 0;

              return label + ": " + value + " Data Pemilih";
            },
          },
        },
      },
    },
  });
}

// ======================================================
// BUKA DATA KECAMATAN
// ======================================================

function bukaDataKecamatan(namaKecamatan) {
  namaKecamatanAktif = namaKecamatan;

  const judul = document.getElementById("judulKecamatan");

  if (judul) {
    judul.innerText = "Kecamatan " + namaKecamatan;
  }

  const section = document.getElementById("dataKecamatanSection");

  if (!section) {
    return;
  }

  section.style.display = "block";

  tampilkanDataKecamatan(namaKecamatan);

  section.scrollIntoView({
    behavior: "smooth",

    block: "start",
  });
}

// ======================================================
// TUTUP DATA KECAMATAN
// ======================================================

function tutupDataKecamatan() {
  namaKecamatanAktif = "";

  const section = document.getElementById("dataKecamatanSection");

  if (section) {
    section.style.display = "none";
  }

  const search = document.getElementById("searchKecamatan");

  if (search) {
    search.value = "";
  }

  window.scrollTo({
    top: 0,

    behavior: "smooth",
  });
}

// ======================================================
// TAMPILKAN DATA KECAMATAN
// ======================================================

function tampilkanDataKecamatan(namaKecamatan) {
  const list = document.getElementById("dataKecamatanList");

  if (!list) {
    return;
  }

  const hasil = dataPemilih.filter((item) => {
    const cocokKab = cocokKabupaten(item.kabupaten);

    const cocokKec = normalisasi(item.kecamatan) === normalisasi(namaKecamatan);

    return cocokKab && cocokKec;
  });

  tampilkanData(hasil);
}

// ======================================================
// SEARCH
// ======================================================

function cariDataKecamatan() {
  if (!namaKecamatanAktif) {
    return;
  }

  const input = document.getElementById("searchKecamatan");

  if (!input) {
    return;
  }

  const keyword = normalisasi(input.value);

  const hasil = dataPemilih.filter((item) => {
    const cocokKab = cocokKabupaten(item.kabupaten);

    const cocokKec =
      normalisasi(item.kecamatan) === normalisasi(namaKecamatanAktif);

    const cocokNama = normalisasi(item.nama).includes(keyword);

    const cocokNIK = normalisasi(item.nik).includes(keyword);

    const cocokNoHP = normalisasi(item.nohp).includes(keyword);

    return cocokKab && cocokKec && (cocokNama || cocokNIK || cocokNoHP);
  });

  tampilkanData(hasil);
}

// ======================================================
// TAMPILKAN CARD DATA
// ======================================================

function tampilkanData(data) {
  const list = document.getElementById("dataKecamatanList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML = `

      <div class="empty">

        Belum ada data pemilih
        di kecamatan ini.

      </div>

    `;

    return;
  }

  data.forEach((item) => {
    list.innerHTML += `

        <div class="card-data">

          <h3>
            ${item.nama || ""}
          </h3>

          <p>
            <b>NIK :</b>
            ${item.nik || ""}
          </p>

          <p>
            <b>No HP :</b>
            ${item.nohp || "-"}
          </p>

          <p>
            <b>RT :</b>
            ${item.rt || ""}
          </p>

          <p>
            <b>RW :</b>
            ${item.rw || ""}
          </p>

          <p>
            <b>Dusun :</b>
            ${item.dusun || ""}
          </p>

          <p>
            <b>Desa :</b>
            ${item.desa || ""}
          </p>

          <p>
            <b>Kecamatan :</b>
            ${item.kecamatan || ""}
          </p>

          <p>
            <b>Kabupaten :</b>
            ${item.kabupaten || ""}
          </p>

          <p>
            <b>Unsur :</b>
            ${item.unsur || ""}
          </p>


          <!-- ================= ACTION ================= -->

          <div class="action">

            <button
              class="edit"
              onclick="editDataKecamatan('${item.id}')"
            >

              <i class="fa-solid fa-pen"></i>

              Edit

            </button>


            <button
              class="delete"
              onclick="hapusDataKecamatan('${item.id}')"
            >

              <i class="fa-solid fa-trash"></i>

              Hapus

            </button>

          </div>

        </div>

      `;
  });
}

// ======================================================
// BUKA TAMBAH DATA
// ======================================================

function bukaTambahKecamatan() {
  if (!namaKecamatanAktif) {
    Swal.fire("Peringatan", "Pilih kecamatan terlebih dahulu.", "warning");

    return;
  }

  modeEditKecamatan = false;

  editIdKecamatan = "";

  const title = document.getElementById("modalKecamatanTitle");

  if (title) {
    title.innerText = "Tambah Data";
  }

  bersihkanFormKecamatan();

  // ==================================================
  // OTOMATIS ISI WILAYAH
  // ==================================================

  const kecamatan = document.getElementById("kecamatanNamaKecamatan");

  const kabupaten = document.getElementById("kecamatanKabupaten");

  if (kecamatan) {
    kecamatan.value = namaKecamatanAktif;

    kecamatan.readOnly = true;
  }

  if (kabupaten) {
    kabupaten.value = namaKabupatenAktif;

    kabupaten.readOnly = true;
  }

  const modal = document.getElementById("modalKecamatanForm");

  if (modal) {
    modal.classList.add("show");
  }
}

// ======================================================
// EDIT DATA
// ======================================================

function editDataKecamatan(id) {
  const item = dataPemilih.find((x) => x.id == id);

  if (!item) {
    Swal.fire("Error", "Data tidak ditemukan.", "error");

    return;
  }

  modeEditKecamatan = true;

  editIdKecamatan = item.id;

  const title = document.getElementById("modalKecamatanTitle");

  if (title) {
    title.innerText = "Edit Data";
  }

  const fields = {
    kecamatanId: item.id,

    kecamatanNama: item.nama,

    kecamatanNik: item.nik,

    kecamatanNohp: item.nohp,

    kecamatanRt: item.rt,

    kecamatanRw: item.rw,

    kecamatanDusun: item.dusun,

    kecamatanDesa: item.desa,

    kecamatanNamaKecamatan: item.kecamatan,

    kecamatanKabupaten: item.kabupaten,

    kecamatanUnsur: item.unsur,
  };

  for (const key in fields) {
    const element = document.getElementById(key);

    if (element) {
      element.value = fields[key] || "";
    }
  }

  // Wilayah tidak boleh diubah
  const kecamatan = document.getElementById("kecamatanNamaKecamatan");

  const kabupaten = document.getElementById("kecamatanKabupaten");

  if (kecamatan) {
    kecamatan.readOnly = true;
  }

  if (kabupaten) {
    kabupaten.readOnly = true;
  }

  const modal = document.getElementById("modalKecamatanForm");

  if (modal) {
    modal.classList.add("show");
  }
}

// ======================================================
// TUTUP MODAL
// ======================================================

function tutupModalKecamatan() {
  const modal = document.getElementById("modalKecamatanForm");

  if (modal) {
    modal.classList.remove("show");
  }
}

// ======================================================
// KLIK DI LUAR MODAL
// ======================================================

window.addEventListener("click", function (e) {
  const modal = document.getElementById("modalKecamatanForm");

  if (modal && e.target === modal) {
    tutupModalKecamatan();
  }
});

// ======================================================
// BERSIHKAN FORM
// ======================================================

function bersihkanFormKecamatan() {
  const fields = [
    "kecamatanId",

    "kecamatanNama",

    "kecamatanNik",

    "kecamatanNohp",

    "kecamatanRt",

    "kecamatanRw",

    "kecamatanDusun",

    "kecamatanDesa",

    "kecamatanNamaKecamatan",

    "kecamatanKabupaten",

    "kecamatanUnsur",
  ];

  fields.forEach((id) => {
    const element = document.getElementById(id);

    if (element) {
      element.value = "";

      element.readOnly = false;
    }
  });
}

// ======================================================
// SIMPAN DATA
// ======================================================

async function simpanDataKecamatan() {
  const data = {
    id: editIdKecamatan,

    nama: document.getElementById("kecamatanNama").value.trim(),

    nik: document.getElementById("kecamatanNik").value.trim(),

    nohp: document.getElementById("kecamatanNohp").value.trim(),

    rt: document.getElementById("kecamatanRt").value.trim(),

    rw: document.getElementById("kecamatanRw").value.trim(),

    dusun: document.getElementById("kecamatanDusun").value.trim(),

    desa: document.getElementById("kecamatanDesa").value.trim(),

    kecamatan: document.getElementById("kecamatanNamaKecamatan").value.trim(),

    kabupaten: document.getElementById("kecamatanKabupaten").value.trim(),

    unsur: document.getElementById("kecamatanUnsur").value.trim(),
  };

  // ==================================================
  // VALIDASI
  // ==================================================

  for (const key in data) {
    if (key !== "id" && data[key] === "") {
      Swal.fire("Peringatan", "Semua field wajib diisi.", "warning");

      return;
    }
  }

  // ==================================================
  // LOADING
  // ==================================================

  Swal.fire({
    title: modeEditKecamatan ? "Mengupdate Data..." : "Menyimpan Data...",

    allowOutsideClick: false,

    didOpen: () => {
      Swal.showLoading();
    },
  });

  let hasil;

  // ==================================================
  // UPDATE
  // ==================================================

  if (modeEditKecamatan) {
    hasil = await updateData(data);
  }

  // ==================================================
  // INSERT
  // ==================================================
  else {
    hasil = await insertData(data);
  }

  Swal.close();

  // ==================================================
  // HASIL
  // ==================================================

  if (hasil && hasil.status) {
    await Swal.fire("Berhasil", hasil.message, "success");

    tutupModalKecamatan();

    await loadData();

    // Tetap tampilkan kecamatan
    if (namaKecamatanAktif) {
      tampilkanDataKecamatan(namaKecamatanAktif);
    }
  } else {
    Swal.fire("Gagal", hasil?.message || "Gagal menyimpan data.", "error");
  }
}

// ======================================================
// HAPUS DATA
// ======================================================

async function hapusDataKecamatan(id) {
  const konfirmasi = await Swal.fire({
    title: "Hapus Data?",

    text: "Data yang dihapus tidak bisa dikembalikan.",

    icon: "warning",

    showCancelButton: true,

    confirmButtonText: "Ya, Hapus",

    cancelButtonText: "Batal",

    confirmButtonColor: "#d33",
  });

  if (!konfirmasi.isConfirmed) {
    return;
  }

  // ==================================================
  // LOADING
  // ==================================================

  Swal.fire({
    title: "Menghapus...",

    allowOutsideClick: false,

    didOpen: () => {
      Swal.showLoading();
    },
  });

  const hasil = await deleteData(id);

  Swal.close();

  // ==================================================
  // HASIL
  // ==================================================

  if (hasil && hasil.status) {
    await Swal.fire("Berhasil", hasil.message, "success");

    await loadData();

    if (namaKecamatanAktif) {
      tampilkanDataKecamatan(namaKecamatanAktif);
    }
  } else {
    Swal.fire("Gagal", hasil?.message || "Gagal menghapus data.", "error");
  }
}

// ======================================================
// END KECAMATAN.JS
// ======================================================
