# 🛒 Inventori BST — Frontend

Antarmuka pengguna untuk sistem inventori berbasis Binary Search Tree (BST). Dibangun dengan HTML, Tailwind CSS, dan Vanilla JavaScript — tanpa framework, tanpa build step.

> Repo ini hanya berisi frontend. Backend (Python + FastAPI) ada di repo terpisah.

---

## 📁 Struktur File

```
/
├── index.html      # Markup UI + konfigurasi Tailwind
└── app.js          # Semua logic: fetch API, render tabel, toast, validasi
```

---

## ⚙️ Cara Menjalankan

### 1. Clone repo

```bash
git clone https://github.com/username/nama-repo-frontend.git
cd nama-repo-frontend
```

### 2. Pastikan backend sudah berjalan

Frontend ini butuh backend FastAPI aktif di `http://localhost:8000`. Jalankan dulu backend-nya sebelum membuka frontend.

### 3. Buka dengan Live Server

Buka `index.html` menggunakan **Live Server** di VS Code (klik kanan → *Open with Live Server*).

---



## ✨ Fitur UI

| Fitur | Deskripsi |
|-------|-----------|
| Tambah Produk | Form input kode, nama, harga, stok — validasi di frontend sebelum kirim |
| Cari Produk | Search by nama, support tekan Enter |
| Tabel Produk | Tampil otomatis urut alfabet (hasil inorder traversal BST) |
| Update Stok | Edit stok langsung di tabel (inline edit) |
| Hapus Produk | Tombol hapus per baris, ada konfirmasi dialog |
| Badge Stok Rendah | Otomatis muncul jika stok < 5 |
| Total Nilai | Ditampilkan di header, update otomatis setiap refresh |
| Toast Notifikasi | Muncul 3 detik setiap ada aksi berhasil atau gagal |

---

## 🛠️ Tech Stack

| | |
|-|-|
| **HTML5** | Struktur halaman |
| **Tailwind CSS** | Styling via CDN — tanpa build step |
| **Vanilla JS** | Fetch API, DOM manipulation |

---

## ⚠️ Catatan

- Tailwind diload via CDN, cukup untuk demo. Untuk production sebaiknya pakai build step (`npm run build`).
- Data bersifat in-memory di sisi backend — refresh halaman tidak menghilangkan data, tapi restart server iya.
