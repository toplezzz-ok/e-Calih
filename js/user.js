// ============================================
// e-Calih v1.1
// user.js
// Statistik + Pencarian Data
// User hanya bisa melihat data
// ============================================

let dataPemilih = [];

let chartKabupaten = null;

// ==============================
// START
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  // LOAD DATA
  loadData();

  // SEARCH
  document.getElementById("searchInput").addEventListener("keyup", cariData);
});

// ==============================
// LOAD DATA
// ==============================

async function loadData() {
  const hasil = await getAllData();

  // ==============================
  // CEK HASIL
  // ==============================

  if (!hasil.status) {
    document.getElementById("dataList").innerHTML = `

        <div class="empty">

          Gagal mengambil data.

        </div>

      `;

    return;
  }

  // ==============================
  // SIMPAN DATA
  // ==============================

  dataPemilih = hasil.data;

  // ==============================
  // TOTAL DATA
  // ==============================

  document.getElementById("totalData").innerHTML = dataPemilih.length;

  // ==============================
  // TAMPILKAN DATA
  // ==============================

  tampilkanData(dataPemilih);

  // ==============================
  // BUAT STATISTIK
  // ==============================

  buatStatistikKabupaten();
}

// ==============================
// TAMPILKAN DATA
// ==============================

function tampilkanData(data) {
  const list = document.getElementById("dataList");

  // KOSONGKAN LIST
  list.innerHTML = "";

  // ==============================
  // JIKA TIDAK ADA DATA
  // ==============================

  if (data.length === 0) {
    list.innerHTML = `

      <div class="empty">

        Data tidak ditemukan.

      </div>

    `;

    return;
  }

  // ==============================
  // LOOP DATA
  // ==============================

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


        </div>

      `;
  });
}

// ==============================
// STATISTIK KABUPATEN
// ==============================

function buatStatistikKabupaten() {
  // ==============================
  // VARIABEL
  // ==============================

  let nganjuk = 0;

  let kabMadiun = 0;

  let kotaMadiun = 0;

  // ==============================
  // HITUNG DATA
  // ==============================

  dataPemilih.forEach((item) => {
    const kabupaten = String(item.kabupaten || "")
      .trim()
      .toLowerCase();

    // ============================
    // KABUPATEN NGANJUK
    // ============================

    if (kabupaten.includes("nganjuk")) {
      nganjuk++;
    }

    // ============================
    // KABUPATEN MADIUN
    // ============================
    else if (
      kabupaten === "kabupaten madiun" ||
      kabupaten === "kab. madiun" ||
      kabupaten === "kab madiun"
    ) {
      kabMadiun++;
    }

    // ============================
    // KOTA MADIUN
    // ============================
    else if (kabupaten === "kota madiun" || kabupaten === "madiun kota") {
      kotaMadiun++;
    }
  });

  // ==============================
  // UPDATE ANGKA NGANJUK
  // ==============================

  const nganjukElement = document.getElementById("nganjukTotal");

  if (nganjukElement) {
    nganjukElement.innerHTML = nganjuk;
  }

  // ==============================
  // UPDATE ANGKA KAB MADIUN
  // ==============================

  const kabMadiunElement = document.getElementById("kabMadiunTotal");

  if (kabMadiunElement) {
    kabMadiunElement.innerHTML = kabMadiun;
  }

  // ==============================
  // UPDATE ANGKA KOTA MADIUN
  // ==============================

  const kotaMadiunElement = document.getElementById("kotaMadiunTotal");

  if (kotaMadiunElement) {
    kotaMadiunElement.innerHTML = kotaMadiun;
  }

  // ==============================
  // AMBIL CANVAS
  // ==============================

  const canvas = document.getElementById("kabupatenChart");

  // JIKA CANVAS TIDAK ADA
  if (!canvas) {
    return;
  }

  // ==============================
  // HAPUS CHART LAMA
  // ==============================

  if (chartKabupaten) {
    chartKabupaten.destroy();
  }

  // ==============================
  // BUAT DIAGRAM DONAT
  // ==============================

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
                // HITUNG TOTAL
                const total = context.dataset.data.reduce(
                  (a, b) => a + b,

                  0,
                );

                // NILAI DATA
                const value = context.raw;

                // PERSENTASE
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
// SEARCH
// ==============================

function cariData() {
  const keyword = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  // ==============================
  // JIKA SEARCH KOSONG
  // ==============================

  if (keyword === "") {
    tampilkanData(dataPemilih);

    return;
  }

  // ==============================
  // FILTER DATA
  // ==============================

  const hasil = dataPemilih.filter((item) => {
    const nama = String(item.nama || "").toLowerCase();

    const nik = String(item.nik || "").toLowerCase();

    return nama.includes(keyword) || nik.includes(keyword);
  });

  // ==============================
  // TAMPILKAN HASIL
  // ==============================

  tampilkanData(hasil);
}

// ==============================
// END
// ==============================
