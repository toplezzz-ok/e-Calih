// ======================================================
// e-Calih v1.4
// admin.js
// Dashboard Admin
// Statistik Kabupaten
// Input No HP
// ======================================================

// ======================================================
// VARIABEL GLOBAL
// ======================================================

let dataPemilih = [];

let modeEdit = false;

let editId = "";

let kabupatenChart = null;

// ======================================================
// START
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  // ==================================================
  // CEK LOGIN ADMIN
  // ==================================================

  if (localStorage.getItem("ecalih_login") !== "true") {
    location.href = "index.html";

    return;
  }

  // ==================================================
  // LOAD SEMUA DATA
  // ==================================================

  loadData();

  // ==================================================
  // LOGOUT
  // ==================================================

  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.onclick = logout;
  }

  // ==================================================
  // SEARCH
  // ==================================================

  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("keyup", cariData);
  }

  // ==================================================
  // TAMBAH DATA
  // ==================================================

  const addBtn = document.getElementById("addBtn");

  if (addBtn) {
    addBtn.onclick = bukaTambah;
  }

  // ==================================================
  // TUTUP MODAL
  // ==================================================

  const closeModal = document.getElementById("closeModal");

  if (closeModal) {
    closeModal.onclick = tutupModal;
  }

  // ==================================================
  // SIMPAN DATA
  // ==================================================

  const saveBtn = document.getElementById("saveBtn");

  if (saveBtn) {
    saveBtn.onclick = simpanData;
  }

  // ==================================================
  // AKTIFKAN KLIK KABUPATEN
  // ==================================================

  aktifkanKlikKabupaten();

  // ==================================================
  // EXPORT EXCEL
  // ==================================================

  const exportExcelBtn = document.getElementById("exportExcelBtn");

  if (exportExcelBtn) {
    exportExcelBtn.onclick = exportExcel;
  }

  // ==================================================
  // EXPORT PDF
  // ==================================================

  const exportPdfBtn = document.getElementById("exportPdfBtn");

  if (exportPdfBtn) {
    exportPdfBtn.onclick = exportPDF;
  }
});

// ======================================================
// LOAD DATA
// ======================================================

async function loadData() {
  Swal.fire({
    title: "Memuat Data...",

    text: "Mengambil data dari database",

    allowOutsideClick: false,

    didOpen: () => {
      Swal.showLoading();
    },
  });

  const hasil = await getAllData();

  Swal.close();

  if (!hasil.status) {
    Swal.fire(
      "Error",

      "Tidak bisa mengambil data dari server.",

      "error",
    );

    return;
  }

  // ====================================================
  // SIMPAN DATA
  // ====================================================

  dataPemilih = hasil.data || [];

  // ====================================================
  // UPDATE TOTAL
  // ====================================================

  updateTotalData();

  // ====================================================
  // UPDATE STATISTIK
  // ====================================================

  updateStatistik();

  // ====================================================
  // TAMPILKAN DATA
  // ====================================================

  tampilkanData(dataPemilih);
}

// ======================================================
// UPDATE TOTAL DATA
// ======================================================

function updateTotalData() {
  const totalElement = document.getElementById("totalData");

  if (totalElement) {
    totalElement.innerHTML = dataPemilih.length;
  }
}

// ======================================================
// UPDATE STATISTIK KABUPATEN
// ======================================================

function updateStatistik() {
  let totalNganjuk = 0;

  let totalKabMadiun = 0;

  let totalKotaMadiun = 0;

  dataPemilih.forEach((item) => {
    const kabupaten = normalisasi(item.kabupaten);

    // ================================================
    // KABUPATEN NGANJUK
    // ================================================

    if (kabupaten === "nganjuk" || kabupaten === "kabupaten nganjuk") {
      totalNganjuk++;
    }

    // ================================================
    // KABUPATEN MADIUN
    // ================================================
    else if (kabupaten === "madiun" || kabupaten === "kabupaten madiun") {
      totalKabMadiun++;
    }

    // ================================================
    // KOTA MADIUN
    // ================================================
    else if (kabupaten === "kota madiun") {
      totalKotaMadiun++;
    }
  });

  // ====================================================
  // TAMPILKAN JUMLAH
  // ====================================================

  setText("nganjukTotal", totalNganjuk);

  setText("kabMadiunTotal", totalKabMadiun);

  setText("kotaMadiunTotal", totalKotaMadiun);

  // ====================================================
  // UPDATE CHART
  // ====================================================

  updateChart(
    totalNganjuk,

    totalKabMadiun,

    totalKotaMadiun,
  );
}

// ======================================================
// NORMALISASI TEKS
// ======================================================

function normalisasi(text) {
  if (text === null || text === undefined) {
    return "";
  }

  return text

    .toString()

    .trim()

    .toLowerCase();
}

// ======================================================
// SET TEXT
// ======================================================

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.innerHTML = value;
  }
}

// ======================================================
// CHART DOUGHNUT
// ======================================================

function updateChart(
  totalNganjuk,

  totalKabMadiun,

  totalKotaMadiun,
) {
  const canvas = document.getElementById("kabupatenChart");

  if (!canvas) {
    return;
  }

  // ====================================================
  // HAPUS CHART LAMA
  // ====================================================

  if (kabupatenChart) {
    kabupatenChart.destroy();
  }

  // ====================================================
  // BUAT CHART
  // ====================================================

  kabupatenChart = new Chart(
    canvas,

    {
      type: "doughnut",

      data: {
        labels: ["Kabupaten Nganjuk", "Kabupaten Madiun", "Kota Madiun"],

        datasets: [
          {
            data: [totalNganjuk, totalKabMadiun, totalKotaMadiun],

            backgroundColor: ["#1f4d36", "#3c7a57", "#74a987"],

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

                const data = context.dataset.data;

                const total = data.reduce(
                  (
                    sum,

                    item,
                  ) => sum + item,

                  0,
                );

                const percentage =
                  total > 0 ? ((value / total) * 100).toFixed(1) : 0;

                return [`${label}`, `${percentage}%`, `${value} Data Pemilih`];
              },
            },
          },
        },
      },
    },
  );
}

// ======================================================
// KLIK KABUPATEN
// ======================================================

function aktifkanKlikKabupaten() {
  const boxes = document.querySelectorAll(".kabupaten-box");

  boxes.forEach((box) => {
    // =================================================
    // CURSOR
    // =================================================

    box.style.cursor = "pointer";

    // =================================================
    // EVENT KLIK
    // =================================================

    box.addEventListener("click", () => {
      // Ambil nama kabupaten dari data-kabupaten
      const namaKabupaten = box.dataset.kabupaten;

      // Cek apakah nama kabupaten tersedia
      if (!namaKabupaten) {
        Swal.fire("Error", "Nama kabupaten tidak ditemukan.", "error");

        return;
      }

      console.log("Kabupaten yang dipilih:", namaKabupaten);

      // Simpan ke sessionStorage
      sessionStorage.setItem("ecalih_kabupaten", namaKabupaten);

      // Pindah ke halaman kecamatan
      location.href =
        "kecamatan.html?kabupaten=" + encodeURIComponent(namaKabupaten);
    });
  });
}

// ======================================================
// TAMPILKAN DATA
// ======================================================

function tampilkanData(data) {
  const list = document.getElementById("dataList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  // ====================================================
  // JIKA TIDAK ADA DATA
  // ====================================================

  if (data.length === 0) {
    list.innerHTML = `

      <div class="empty">

        Tidak ada data.

      </div>

    `;

    return;
  }

  // ====================================================
  // TAMPILKAN DATA
  // ====================================================

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


          <div class="action">


            <button

              class="edit"

              onclick="editData('${item.id}')"

            >

              <i

                class="fa-solid fa-pen"

              ></i>

              Edit

            </button>


            <button

              class="delete"

              onclick="hapusData('${item.id}')"

            >

              <i

                class="fa-solid fa-trash"

              ></i>

              Hapus

            </button>


          </div>


        </div>

      `;
  });
}

// ======================================================
// SEARCH
// ======================================================

function cariData() {
  const input = document.getElementById("searchInput");

  if (!input) {
    return;
  }

  const keyword = normalisasi(input.value);

  const hasil = dataPemilih.filter((item) => {
    return (
      normalisasi(item.nama).includes(keyword) ||
      normalisasi(item.nik).includes(keyword) ||
      normalisasi(item.nohp).includes(keyword)
    );
  });

  tampilkanData(hasil);
}

// ======================================================
// BUKA TAMBAH
// ======================================================

function bukaTambah() {
  modeEdit = false;

  editId = "";

  setText(
    "modalTitle",

    "Tambah Data",
  );

  bersihkanForm();

  const modal = document.getElementById("modalForm");

  if (modal) {
    modal.classList.add("show");
  }
}

// ======================================================
// TUTUP MODAL
// ======================================================

function tutupModal() {
  const modal = document.getElementById("modalForm");

  if (modal) {
    modal.classList.remove("show");
  }
}

// ======================================================
// KLIK DI LUAR MODAL
// ======================================================

window.onclick = function (e) {
  const modal = document.getElementById("modalForm");

  if (modal && e.target === modal) {
    tutupModal();
  }
};

// ======================================================
// BERSIHKAN FORM
// ======================================================

function bersihkanForm() {
  const fields = [
    "id",

    "nama",

    "nik",

    "nohp",

    "rt",

    "rw",

    "dusun",

    "desa",

    "kecamatan",

    "kabupaten",

    "unsur",
  ];

  fields.forEach((id) => {
    const element = document.getElementById(id);

    if (element) {
      element.value = "";
    }
  });
}

// ======================================================
// LOGOUT
// ======================================================

function logout() {
  Swal.fire({
    title: "Logout?",

    text: "Apakah Anda yakin ingin keluar?",

    icon: "question",

    showCancelButton: true,

    confirmButtonText: "Ya, Logout",

    cancelButtonText: "Batal",

    confirmButtonColor: "#1f4d36",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("ecalih_login");

      localStorage.removeItem("ecalih_username");

      location.href = "index.html";
    }
  });
}

// ======================================================
// SIMPAN DATA
// ======================================================

async function simpanData() {
  const data = {
    // ID
    id: editId,

    // NAMA
    nama: document.getElementById("nama").value.trim(),

    // NIK
    nik: document.getElementById("nik").value.trim(),

    // NO HP
    nohp: document.getElementById("nohp").value.trim(),

    // RT
    rt: document.getElementById("rt").value.trim(),

    // RW
    rw: document.getElementById("rw").value.trim(),

    // DUSUN
    dusun: document.getElementById("dusun").value.trim(),

    // DESA
    desa: document.getElementById("desa").value.trim(),

    // KECAMATAN
    kecamatan: document.getElementById("kecamatan").value.trim(),

    // KABUPATEN
    kabupaten: document.getElementById("kabupaten").value.trim(),

    // UNSUR
    unsur: document.getElementById("unsur").value.trim(),
  };

  // ====================================================
  // VALIDASI
  // ====================================================

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

  // ====================================================
  // LOADING
  // ====================================================

  Swal.fire({
    title: modeEdit ? "Mengupdate Data..." : "Menyimpan Data...",

    allowOutsideClick: false,

    didOpen: () => {
      Swal.showLoading();
    },
  });

  let hasil;

  // ====================================================
  // UPDATE
  // ====================================================

  if (modeEdit) {
    hasil = await updateData(data);
  }

  // ====================================================
  // INSERT
  // ====================================================
  else {
    hasil = await insertData(data);
  }

  Swal.close();

  // ====================================================
  // HASIL
  // ====================================================

  if (hasil.status) {
    Swal.fire(
      "Berhasil",

      hasil.message,

      "success",
    );

    tutupModal();

    await loadData();
  } else {
    Swal.fire(
      "Gagal",

      hasil.message,

      "error",
    );
  }
}

// ======================================================
// EDIT DATA
// ======================================================

function editData(id) {
  const item = dataPemilih.find((x) => x.id == id);

  if (!item) {
    Swal.fire(
      "Error",

      "Data tidak ditemukan.",

      "error",
    );

    return;
  }

  // ====================================================
  // MODE EDIT
  // ====================================================

  modeEdit = true;

  editId = item.id;

  setText(
    "modalTitle",

    "Edit Data",
  );

  // ====================================================
  // ISI FORM
  // ====================================================

  const fields = {
    id: item.id,

    nama: item.nama,

    nik: item.nik,

    nohp: item.nohp,

    rt: item.rt,

    rw: item.rw,

    dusun: item.dusun,

    desa: item.desa,

    kecamatan: item.kecamatan,

    kabupaten: item.kabupaten,

    unsur: item.unsur,
  };

  for (const key in fields) {
    const element = document.getElementById(key);

    if (element) {
      element.value = fields[key] || "";
    }
  }

  // ====================================================
  // BUKA MODAL
  // ====================================================

  const modal = document.getElementById("modalForm");

  if (modal) {
    modal.classList.add("show");
  }
}

// ======================================================
// HAPUS DATA
// ======================================================

async function hapusData(id) {
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

  // ====================================================
  // LOADING
  // ====================================================

  Swal.fire({
    title: "Menghapus...",

    allowOutsideClick: false,

    didOpen: () => {
      Swal.showLoading();
    },
  });

  const hasil = await deleteData(id);

  Swal.close();

  // ====================================================
  // HASIL
  // ====================================================

  if (hasil.status) {
    Swal.fire(
      "Berhasil",

      hasil.message,

      "success",
    );

    await loadData();
  } else {
    Swal.fire(
      "Gagal",

      hasil.message,

      "error",
    );
  }
}

// ======================================================
// EXPORT EXCEL
// ======================================================

function exportExcel() {
  if (!dataPemilih || dataPemilih.length === 0) {
    Swal.fire("Informasi", "Belum ada data pemilih untuk diekspor.", "info");

    return;
  }

  // Siapkan data untuk Excel
  const dataExport = dataPemilih.map((item, index) => {
    return {
      No: index + 1,
      Nama: item.nama || "",
      NIK: item.nik || "",
      "No HP": item.nohp || "",
      RT: item.rt || "",
      RW: item.rw || "",
      Dusun: item.dusun || "",
      Desa: item.desa || "",
      Kecamatan: item.kecamatan || "",
      Kabupaten: item.kabupaten || "",
      Unsur: item.unsur || "",
    };
  });

  // Buat worksheet
  const worksheet = XLSX.utils.json_to_sheet(dataExport);

  // Buat workbook
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pemilih");

  // Atur lebar kolom
  worksheet["!cols"] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 20 },
    { wch: 18 },
    { wch: 8 },
    { wch: 8 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 25 },
    { wch: 20 },
  ];

  // Nama file
  const tanggal = new Date().toISOString().slice(0, 10);

  XLSX.writeFile(workbook, `e-Calih_Data_Pemilih_${tanggal}.xlsx`);

  Swal.fire("Berhasil", "Data pemilih berhasil diekspor ke Excel.", "success");
}

// ======================================================
// EXPORT PDF
// ======================================================

function exportPDF() {
  if (!dataPemilih || dataPemilih.length === 0) {
    Swal.fire("Informasi", "Belum ada data pemilih untuk diekspor.", "info");

    return;
  }

  const { jsPDF } = window.jspdf;

  // Buat PDF landscape
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // ==================================================
  // JUDUL
  // ==================================================

  doc.setFontSize(18);

  doc.text("e-Calih - Data Calon Pemilih", 14, 15);

  // ==================================================
  // INFORMASI
  // ==================================================

  doc.setFontSize(10);

  doc.text("Total Data Pemilih: " + dataPemilih.length + " Orang", 14, 22);

  const tanggal = new Date().toLocaleDateString("id-ID");

  doc.text("Tanggal Export: " + tanggal, 14, 28);

  // ==================================================
  // DATA TABEL
  // ==================================================

  const rows = dataPemilih.map((item, index) => {
    return [
      index + 1,
      item.nama || "",
      item.nik || "",
      item.nohp || "-",
      item.rt || "",
      item.rw || "",
      item.dusun || "",
      item.desa || "",
      item.kecamatan || "",
      item.kabupaten || "",
      item.unsur || "",
    ];
  });

  // ==================================================
  // TABEL
  // ==================================================

  doc.autoTable({
    startY: 34,

    head: [
      [
        "No",
        "Nama",
        "NIK",
        "No HP",
        "RT",
        "RW",
        "Dusun",
        "Desa",
        "Kecamatan",
        "Kabupaten",
        "Unsur",
      ],
    ],

    body: rows,

    styles: {
      fontSize: 7,
      cellPadding: 2,
    },

    headStyles: {
      fontSize: 7,
    },

    margin: {
      left: 10,
      right: 10,
    },

    didDrawPage: function () {
      const pageNumber = doc.internal.getNumberOfPages();

      doc.setFontSize(8);

      doc.text(
        "e-Calih | Halaman " + pageNumber,
        14,
        doc.internal.pageSize.height - 8,
      );
    },
  });

  // ==================================================
  // SIMPAN PDF
  // ==================================================

  const tanggalFile = new Date().toISOString().slice(0, 10);

  doc.save(`e-Calih_Data_Pemilih_${tanggalFile}.pdf`);

  Swal.fire("Berhasil", "Data pemilih berhasil diekspor ke PDF.", "success");
}

// ======================================================
// END ADMIN.JS
// ======================================================
