// app.js
// ─────────────────────────────────────────────────────────────
// Semua interaksi UI → API.
// Ganti BASE_URL ke URL Railway kamu setelah deploy.
// ─────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:8000"; // ← ganti saat deploy

// ── UTILITY ──────────────────────────────────────────────────

// Format angka ke Rupiah: 15000 → "Rp 15.000"
const formatRupiah = (n) => "Rp " + Number(n).toLocaleString("id-ID");

// Toast notification — muncul 3 detik lalu fade out
function showToast(msg, isError = false) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.toggle("bg-red-700", isError);
  el.classList.toggle("bg-gray-800", !isError);
  el.style.opacity = "1";
  setTimeout(() => {
    el.style.opacity = "0";
  }, 3000);
}

// Generic fetch wrapper — handle error response JSON otomatis
async function apiFetch(path, options = {}) {
  const res = await fetch(BASE_URL + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    // FastAPI error format: { detail: "..." }
    throw new Error(data.detail || "Terjadi kesalahan.");
  }
  return data;
}

// ── LOAD & RENDER TABEL ──────────────────────────────────────

async function loadProduk() {
  const loader = document.getElementById("loader");
  const wrapper = document.getElementById("tabel-wrapper");
  const empty = document.getElementById("empty-state");

  // Reset ke loading state
  loader.classList.remove("hidden");
  wrapper.classList.add("hidden");
  empty.classList.add("hidden");

  try {
    const res = await apiFetch("/produk");

    // Update total nilai di header
    document.getElementById("total-nilai").textContent = formatRupiah(
      res.total_nilai,
    );

    loader.classList.add("hidden");

    if (res.data.length === 0) {
      empty.classList.remove("hidden");
      return;
    }

    wrapper.classList.remove("hidden");
    renderTabel(res.data);
  } catch (e) {
    loader.classList.add("hidden");
    showToast("Gagal memuat data: " + e.message, true);
  }
}

function renderTabel(produkList) {
  const tbody = document.getElementById("tabel-body");
  tbody.innerHTML = ""; // clear dulu

  produkList.forEach((p) => {
    const stokRendah = p.stok_rendah;

    // Template literal untuk setiap baris
    const tr = document.createElement("tr");
    tr.className = "hover:bg-amber-50 transition-colors fade-in";
    tr.innerHTML = `
      <td class="px-4 py-3 font-mono text-xs text-gray-500">${p.kode}</td>
      <td class="px-4 py-3 font-medium">${p.nama}</td>
      <td class="px-4 py-3">${formatRupiah(p.harga)}</td>
      <td class="px-4 py-3">
        <!-- Input stok bisa langsung diedit inline -->
        <input type="number" min="0" value="${p.stok}"
               class="w-16 border border-gray-200 rounded px-2 py-1 text-sm
                      focus:outline-none focus:ring-1 focus:ring-brand-mid
                      ${stokRendah ? "border-red-400 bg-red-50" : ""}"
               onchange="updateStok('${p.nama}', this.value)"/>
      </td>
      <td class="px-4 py-3">
        ${
          stokRendah
            ? `<span class="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">⚠ Stok Rendah</span>`
            : `<span class="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">✓ Normal</span>`
        }
      </td>
      <td class="px-4 py-3">
        <button onclick="hapusProduk('${p.nama}')"
                class="text-red-500 hover:text-red-700 text-xs font-medium transition-colors">
          Hapus
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ── TAMBAH PRODUK ─────────────────────────────────────────────

async function tambahProduk() {
  const kode = document.getElementById("inp-kode").value.trim();
  const nama = document.getElementById("inp-nama").value.trim();
  const harga = parseInt(document.getElementById("inp-harga").value);
  const stok = parseInt(document.getElementById("inp-stok").value);

  // Validasi di frontend sebelum kirim ke server
  if (!kode || !nama || isNaN(harga) || isNaN(stok)) {
    showToast("Semua field wajib diisi dengan benar.", true);
    return;
  }
  if (harga <= 0) {
    showToast("Harga harus lebih dari 0.", true);
    return;
  }
  if (stok < 0) {
    showToast("Stok tidak boleh negatif.", true);
    return;
  }

  try {
    const res = await apiFetch("/produk", {
      method: "POST",
      body: JSON.stringify({ kode, nama, harga, stok }),
    });
    showToast(res.message);

    // Kosongkan input setelah berhasil
    ["inp-kode", "inp-nama", "inp-harga", "inp-stok"].forEach((id) => {
      document.getElementById(id).value = "";
    });

    loadProduk(); // refresh tabel
  } catch (e) {
    showToast(e.message, true);
  }
}

// ── CARI PRODUK ──────────────────────────────────────────────

async function cariProduk() {
  const nama = document.getElementById("inp-cari").value.trim();
  if (!nama) {
    showToast("Masukkan nama produk dulu.", true);
    return;
  }

  const box = document.getElementById("hasil-cari");

  try {
    const res = await apiFetch(`/produk/${encodeURIComponent(nama)}`);
    const p = res.data;
    box.classList.remove("hidden");
    box.innerHTML = `
      <div class="flex items-start justify-between">
        <div>
          <p class="font-semibold text-base">${p.nama}
            <span class="font-mono text-xs text-gray-400 ml-2">${p.kode}</span>
          </p>
          <p class="text-gray-600 mt-1">${formatRupiah(p.harga)} &nbsp;·&nbsp; Stok: <strong>${p.stok}</strong></p>
          ${
            p.stok < 5
              ? `<p class="text-red-600 text-xs mt-1">⚠ Stok di bawah batas minimum</p>`
              : ""
          }
        </div>
        <span class="text-green-600 text-lg">✓</span>
      </div>
    `;
  } catch (e) {
    box.classList.remove("hidden");
    box.innerHTML = `<p class="text-red-600">❌ ${e.message}</p>`;
  }
}

// ── UPDATE STOK (inline edit) ─────────────────────────────────

async function updateStok(nama, stokBaru) {
  const stok = parseInt(stokBaru);
  if (isNaN(stok) || stok < 0) {
    showToast("Nilai stok tidak valid.", true);
    loadProduk(); // reset ke nilai lama
    return;
  }
  try {
    const res = await apiFetch(`/produk/${encodeURIComponent(nama)}/stok`, {
      method: "PATCH",
      body: JSON.stringify({ stok }),
    });
    showToast(res.message);
    loadProduk(); // refresh biar badge stok rendah ikut update
  } catch (e) {
    showToast(e.message, true);
    loadProduk();
  }
}

// ── HAPUS PRODUK ─────────────────────────────────────────────

async function hapusProduk(nama) {
  // Konfirmasi dulu — penting untuk UX dan error handling demo
  if (!confirm(`Hapus produk "${nama}"?`)) return;

  try {
    const res = await apiFetch(`/produk/${encodeURIComponent(nama)}`, {
      method: "DELETE",
    });
    showToast(res.message);
    loadProduk();
  } catch (e) {
    showToast(e.message, true);
  }
}

// ── INIT ─────────────────────────────────────────────────────
// Load data saat halaman pertama kali dibuka
loadProduk();
