// ======================================================
// e-Calih v1.4
// USER.JS
// Statistik Kabupaten
// Statistik Kecamatan
// Data Pemilih
// READ ONLY
// ======================================================

let dataPemilih = [];

let chartKabupaten = null;

let chartKecamatan = null;

let namaKabupatenAktif = "";

let namaKecamatanAktif = "";

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
  const searchInput = document.getElementById("searchInput");

  if (searchInput) {
    searchInput.addEventListener("keyup", cariData);
  }

  const searchKecamatan = document.getElementById("searchKecamatan");

  if (searchKecamatan) {
    searchKecamatan.addEventListener("keyup", cariDataKecamatan);
  }

  const kembaliKabupatenBtn = document.getElementById("kembaliKabupatenBtn");

  if (kembaliKabupatenBtn) {
    kembaliKabupatenBtn.onclick = tutupKecamatan;
  }

  const closeDataBtn = document.getElementById("closeDataBtn");

  if (closeDataBtn) {
    closeDataBtn.onclick = tutupDataKecamatan;
  }

  await loadData();
});

// ======================================================
// LOAD DATA
// ======================================================

async function loadData() {
  try {
    const hasil = await getAllData();

    if (!hasil || !hasil.status) {
      document.getElementById("dataList").innerHTML = `

        <div class="empty">

          Gagal mengambil data.

        </div>

      `;

      return;
    }

    dataPemilih = hasil.data || [];

    console.log("Total data:", dataPemilih.length);

    // ==================================================
    // TOTAL SEMUA DATA
    // ==================================================

    const totalData = document.getElementById("totalData");

    if (totalData) {
      totalData.innerText = dataPemilih.length;
    }

    // ==================================================
    // STATISTIK KABUPATEN
    // ==================================================

    buatStatistikKabupaten();

    // ==================================================
    // DATA AWAL
    // ==================================================

    tampilkanData(dataPemilih);
  } catch (error) {
    console.error("ERROR LOAD DATA:", error);

    const dataList = document.getElementById("dataList");

    if (dataList) {
      dataList.innerHTML = `

        <div class="empty">

          Gagal mengambil data.

        </div>

      `;
    }
  }
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

function cocokKabupaten(nilaiKabupaten, namaKabupaten) {
  const kabupaten = normalisasi(nilaiKabupaten);

  const aktif = normalisasi(namaKabupaten);

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
// HITUNG KABUPATEN
// ======================================================

function hitungKabupaten(namaKabupaten) {
  let total = 0;

  dataPemilih.forEach((item) => {
    if (cocokKabupaten(item.kabupaten, namaKabupaten)) {
      total++;
    }
  });

  return total;
}

// ======================================================
// STATISTIK KABUPATEN
// ======================================================

function buatStatistikKabupaten() {
  const nganjuk = hitungKabupaten("Kabupaten Nganjuk");

  const kabMadiun = hitungKabupaten("Kabupaten Madiun");

  const kotaMadiun = hitungKabupaten("Kota Madiun");

  // ==================================================
  // UPDATE ANGKA
  // ==================================================

  const nganjukElement = document.getElementById("nganjukTotal");

  if (nganjukElement) {
    nganjukElement.innerText = nganjuk;
  }

  const kabMadiunElement = document.getElementById("kabMadiunTotal");

  if (kabMadiunElement) {
    kabMadiunElement.innerText = kabMadiun;
  }

  const kotaMadiunElement = document.getElementById("kotaMadiunTotal");

  if (kotaMadiunElement) {
    kotaMadiunElement.innerText = kotaMadiun;
  }

  // ==================================================
  // CHART
  // ==================================================

  const canvas = document.getElementById("kabupatenChart");

  if (!canvas) {
    return;
  }

  if (chartKabupaten) {
    chartKabupaten.destroy();
  }

  chartKabupaten = new Chart(canvas, {
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
        },

        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);

              const value = context.raw;

              let percentage = 0;

              if (total > 0) {
                percentage = ((value / total) * 100).toFixed(1);
              }

              return (
                context.label + ": " + value + " data (" + percentage + "%)"
              );
            },
          },
        },
      },
    },
  });
}

// ======================================================
// BUKA KABUPATEN
// ======================================================

function bukaKabupaten(namaKabupaten) {
  namaKabupatenAktif = namaKabupaten;

  // ==================================================
  // SET SESSION STORAGE
  // ==================================================

  sessionStorage.setItem("ecalih_kabupaten", namaKabupaten);

  // ==================================================
  // UPDATE JUDUL
  // ==================================================

  const namaElement = document.getElementById("namaKabupatenAktif");

  if (namaElement) {
    namaElement.innerText = namaKabupaten;
  }

  // ==================================================
  // HITUNG TOTAL
  // ==================================================

  const total = hitungKabupaten(namaKabupaten);

  const totalElement = document.getElementById("totalKabupaten");

  if (totalElement) {
    totalElement.innerText = total;
  }

  // ==================================================
  // TAMPILKAN SECTION
  // ==================================================

  const section = document.getElementById("kecamatanSection");

  if (!section) {
    return;
  }

  section.style.display = "block";

  // ==================================================
  // TAMPILKAN KECAMATAN
  // ==================================================

  tampilkanKecamatan();

  // ==================================================
  // SCROLL
  // ==================================================

  section.scrollIntoView({
    behavior: "smooth",

    block: "start",
  });
}

// ======================================================
// TAMPILKAN KECAMATAN
// ======================================================

function tampilkanKecamatan() {
  const container = document.getElementById("kecamatanStats");

  if (!container) {
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
  // LOOP KECAMATAN
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
            Kecamatan
            ${namaKecamatan}
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

  updateChartKecamatan(labels, values);
}

// ======================================================
// HITUNG DATA KECAMATAN
// ======================================================

function hitungDataKecamatan(namaKecamatan) {
  let jumlah = 0;

  dataPemilih.forEach((item) => {
    const cocokKab = cocokKabupaten(item.kabupaten, namaKabupatenAktif);

    const cocokKec = normalisasi(item.kecamatan) === normalisasi(namaKecamatan);

    if (cocokKab && cocokKec) {
      jumlah++;
    }
  });

  return jumlah;
}

// ======================================================
// CHART KECAMATAN
// ======================================================

function updateChartKecamatan(labels, values) {
  const canvas = document.getElementById("kecamatanChart");

  if (!canvas) {
    return;
  }

  if (chartKecamatan) {
    chartKecamatan.destroy();
  }

  chartKecamatan = new Chart(canvas, {
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
// TUTUP KECAMATAN
// ======================================================

function tutupKecamatan() {
  const section = document.getElementById("kecamatanSection");

  if (section) {
    section.style.display = "none";
  }

  const dataSection = document.getElementById("dataKecamatanSection");

  if (dataSection) {
    dataSection.style.display = "none";
  }

  namaKabupatenAktif = "";

  namaKecamatanAktif = "";
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
}

// ======================================================
// TAMPILKAN DATA KECAMATAN
// ======================================================

function tampilkanDataKecamatan(namaKecamatan) {
  const hasil = dataPemilih.filter((item) => {
    const cocokKab = cocokKabupaten(item.kabupaten, namaKabupatenAktif);

    const cocokKec = normalisasi(item.kecamatan) === normalisasi(namaKecamatan);

    return cocokKab && cocokKec;
  });

  tampilkanDataKecamatanList(hasil);
}

// ======================================================
// SEARCH KECAMATAN
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
    const cocokKab = cocokKabupaten(item.kabupaten, namaKabupatenAktif);

    const cocokKec =
      normalisasi(item.kecamatan) === normalisasi(namaKecamatanAktif);

    const cocokNama = normalisasi(item.nama).includes(keyword);

    const cocokNIK = normalisasi(item.nik).includes(keyword);

    const cocokNoHP = normalisasi(item.nohp).includes(keyword);

    return cocokKab && cocokKec && (cocokNama || cocokNIK || cocokNoHP);
  });

  tampilkanDataKecamatanList(hasil);
}

// ======================================================
// TAMPILKAN DATA KECAMATAN
// ======================================================

function tampilkanDataKecamatanList(data) {
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

        </div>

      `;
  });
}

// ======================================================
// SEARCH GLOBAL
// ======================================================

function cariData() {
  const input = document.getElementById("searchInput");

  if (!input) {
    return;
  }

  const keyword = normalisasi(input.value);

  if (keyword === "") {
    tampilkanData(dataPemilih);

    return;
  }

  const hasil = dataPemilih.filter((item) => {
    const nama = normalisasi(item.nama);

    const nik = normalisasi(item.nik);

    return nama.includes(keyword) || nik.includes(keyword);
  });

  tampilkanData(hasil);
}

// ======================================================
// TAMPILKAN DATA GLOBAL
// ======================================================

function tampilkanData(data) {
  const list = document.getElementById("dataList");

  if (!list) {
    return;
  }

  list.innerHTML = "";

  if (data.length === 0) {
    list.innerHTML = `

      <div class="empty">

        Data tidak ditemukan.

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

        </div>

      `;
  });
}

// ======================================================
// END USER.JS
// ======================================================
