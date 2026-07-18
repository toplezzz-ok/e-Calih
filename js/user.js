// ============================================
// e-Calih v1.0
// user.js
// ============================================

let dataPemilih = [];

// ==============================
// START
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  document.getElementById("searchInput").addEventListener("keyup", cariData);
});

// ==============================
// LOAD DATA
// ==============================

async function loadData() {
  const hasil = await getAllData();

  if (!hasil.status) {
    document.getElementById("dataList").innerHTML = `

            <div class="empty">

                Gagal mengambil data.

            </div>

        `;

    return;
  }

  dataPemilih = hasil.data;

  tampilkanData(dataPemilih);
}

// ==============================
// TAMPILKAN DATA
// ==============================

function tampilkanData(data) {
  const list = document.getElementById("dataList");

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

            <h3>${item.nama}</h3>

            <p><b>NIK :</b> ${item.nik}</p>

            <p><b>RT :</b> ${item.rt}</p>

            <p><b>RW :</b> ${item.rw}</p>

            <p><b>Dusun :</b> ${item.dusun}</p>

            <p><b>Desa :</b> ${item.desa}</p>

            <p><b>Kecamatan :</b> ${item.kecamatan}</p>

            <p><b>Kabupaten :</b> ${item.kabupaten}</p>

            <p><b>Unsur :</b> ${item.unsur}</p>

        </div>

        `;
  });
}

// ==============================
// SEARCH
// ==============================

function cariData() {
  const keyword = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  if (keyword === "") {
    tampilkanData(dataPemilih);

    return;
  }

  const hasil = dataPemilih.filter((item) => {
    return (
      item.nama.toLowerCase().includes(keyword) ||
      item.nik.toLowerCase().includes(keyword)
    );
  });

  tampilkanData(hasil);
}
