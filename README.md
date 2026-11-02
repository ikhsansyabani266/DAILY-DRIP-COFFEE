# ☕ Dialy Drip Coffee — Online Ordering System

> **Tugas Praktikum / Proyek Mandiri**  
> **Mata Kuliah:** Perancangan dan Pemrograman Web (Semester 3)  
> **Pengembang:** Muhamad Ikhsan Syabani  

---

## 📌 Deskripsi Proyek

**Dialy Drip Coffee** adalah aplikasi web pemesanan kopi interaktif yang dirancang dengan estetika modern bergaya editorial kedai kopi (*coffee warmth palette*). Aplikasi ini memungkinkan pelanggan untuk menjelajahi katalog menu, mengkustomisasi racikan minuman (temperatur, kadar gula, topping tambahan), memasukkan kode voucher promo, dan melakukan pemesanan langsung terhubung ke **WhatsApp Toko** secara otomatis.

Seluruh sistem dibangun menggunakan arsitektur **Frontend-Only murni (Vanilla HTML5, CSS3, JavaScript)** tanpa memerlukan backend server, database, maupun dependensi eksternal.

---

## ✨ Fitur Utama

### 1. ☕ Katalog Menu Interaktif (20 Pilihan Minuman)
- Katalog menu terbagi menjadi 4 kategori utama:
  - **White-Milk** (kopi berbasis susu: Aren, Pandan, Hazelnut, Vanilla, dll.)
  - **Black** (kopi murni: Americano, Espresso, Filter V60, Cold Brew, dll.)
  - **Non-Coffee** (Matcha, Chocolate, Red Velvet, Taro, dll.)
  - **Tea & Others** (Lychee Tea, Earl Grey, Lemon Honey, dll.)
- Filter kategori responsif dengan transisi dinamis.
- Kartu menu menampilkan foto asli produk lokal, nama, deskripsi rasa, komposisi bahan, dan harga.

### 2. 🎛️ Dialog Kustomisasi Minuman (Modal Dialog)
- Pelanggan dapat mengatur preferensi setiap minuman sebelum masuk ke keranjang:
  - **Temperatur**: Dingin (Ice) atau Hangat (Hot).
  - **Level Gula**: Normal (100%), Sedikit Gula (Less Sugar 50%), atau Tanpa Gula (No Sugar 0%).
  - **Topping Tambahan**: Tambah Espresso Shot (+Rp4.000), Grass Jelly (+Rp3.000), Caramel Drizzle (+Rp3.000).
- Setiap kombinasi varian memiliki unit harga dan identitas tersendiri di keranjang belanja.
- Tombol **"Ubah Varian"** di keranjang memungkinkan modifikasi kustomisasi tanpa harus menghapus item.

### 3. 🛒 Keranjang Belanja Dinamis & Real-Time
- Manajemen item berbasis `Map` JavaScript untuk performa tinggi.
- Penambahan, pengurangan (*quantity*), serta penghapusan item pesanan.
- Input catatan khusus per gelas (contoh: *"sedikit es"*, *"jangan pakai sedotan"*).
- Badge indikator jumlah pesanan di navigasi atas.
- Tampilan status kosong (*empty state*) yang informatif dengan tautan kembali ke menu.

### 4. 🏷️ Sistem Voucher Kode Promo
- Input kode promo yang fleksibel dengan validasi instan.
- **Badge Status Promo Aktif**: Hanya muncul di bawah kolom input saat kode promo berhasil diterapkan (dilengkapi nama kode, besaran potongan, dan tombol *✕ Hapus*).
- Penghitungan diskon otomatis saat memenuhi syarat minimal belanja.
- Diskon otomatis direset saat keranjang kosong atau saat voucher dihapus.

#### Daftar Kode Promo yang Tersedia:
| Kode Promo | Tipe Diskon | Potongan | Syarat Min. Belanja | Maks. Diskon |
| :--- | :---: | :---: | :---: | :---: |
| **`DIALYHEMAT`** | Persentase | 20% | Rp30.000 | Rp15.000 |
| **`NGOPIASIK`** | Nominal | Rp5.000 | Rp25.000 | — |
| **`DISKON10`** | Persentase | 10% | Rp0 (Tanpa Syarat) | Rp50.000 |
| **`JUMATBERKAH`** | Nominal | Rp10.000 | Rp40.000 | — |

### 5. 📋 Form Checkout & Integrasi WhatsApp
- Formulir data pemesan dengan validasi data:
  - Nama pelanggan
  - Nomor WhatsApp pelanggan (format angka Indonesia)
  - Metode pesanan: **Dine In**, **Takeaway (Pickup)**, atau **Delivery**
  - Metode pembayaran: **Cash (Tunai)** atau **QRIS / Transfer Bank**
  - Catatan tambahan pesanan
- **Format Pesanan WhatsApp Otomatis**: Menghasilkan tautan langsung ke `https://wa.me/` dengan pesan terstruktur rapi yang memuat rincian minuman, varian, catatan, subtotal, rincian promo, dan total bayar.

### 6. 📌 Papan Buletin Retro (About Section)
- Bagian *Our Story* dengan desain papan pengumuman kayu (*bulletin corkboard*) dan aksen *sticky notes* estetik.

### 7. 🔔 Sistem Notifikasi Toast
- Notifikasi mengambang (*toast popup*) yang elegan untuk memberi umpan balik instan saat produk ditambahkan, promo berhasil dipasang, atau terjadi kesalahan input.

---

## 🛠️ Tech Stack & Arsitektur

- **HTML5**: Struktur semantik, aksesibilitas (`aria-*`), tag meta responsif, dan modal dialog.
- **CSS3**:
  - CSS Custom Properties (Design Tokens) untuk warna, tipografi, dan spasi.
  - Modern Layout: CSS Grid, Flexbox, dan Multi-Column layouts.
  - Fluid Typography (`clamp()`) untuk keterbacaan di berbagai resolusi layar.
  - Micro-interactions, hover effects, dan transisi halus.
- **Vanilla JavaScript (ES6+)**:
  - Data structures (`Map`, `Array`, `Object`).
  - Event-driven architecture (DOM Manipulation & Delegation).
  - Web Storage API (`localStorage`) untuk menyimpan status keranjang.
  - `Intl.NumberFormat('id-ID')` untuk formatting mata uang Rupiah standar.
  - WhatsApp Click-to-Chat URL Encoder API.
- **Google Fonts**: *Plus Jakarta Sans*, *Inter*, dan *Fraunces*.

---

## 📁 Struktur Direktori Proyek

```text
dialy-drip-coffee/
├── Dialy_Drip_20_Foto_Produk/    # Direktori foto katalog produk & latar belakang
│   ├── bar_dialy_drip.jpg
│   ├── aren_latte.jpg
│   ├── americano.jpg
│   └── ... (20 foto minuman resmi)
├── arsitektur.md                  # Dokumentasi arsitektur sistem
├── index.html                     # Halaman web utama
├── instruction.md                 # Panduan singkat pengembang
├── prd.md                         # Product Requirement Document (PRD)
├── README.md                      # Dokumentasi utama proyek
├── script.js                      # Logika aplikasi, keranjang, kustomisasi & promo
├── style.css                      # Seluruh styling, tema warna, layout & animasi
├── tech_stack.md                  # Spesifikasi teknologi yang digunakan
└── ui.ux.md                       # Panduan pedoman desain UI/UX
```

---

## 🚀 Cara Menjalankan Proyek

Proyek ini tidak memerlukan instalasi Node.js, PHP, Apache, atau package manager apa pun.

1. **Unduh / Clone Repositori**:
   Pastikan seluruh file berada dalam satu direktori bersama folder `Dialy_Drip_20_Foto_Produk/`.
2. **Jalankan di Browser**:
   - Klik ganda berkas `index.html` untuk langsung membukanya di browser apa saja (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari), **ATAU**
   - Jika menggunakan **VS Code**, klik kanan pada `index.html` lalu pilih **"Open with Live Server"**.

---

## ⚙️ Panduan Konfigurasi

### Mengganti Nomor WhatsApp Toko:
Buka file `script.js` pada baris ke-7 dan perbarui variabel:
```javascript
const NOMOR_WHATSAPP_TOKO = "62895327292342"; // Ganti dengan nomor WhatsApp tujuan (diawali 62)
```

### Menambah atau Mengubah Kode Promo:
Buka file `script.js` pada objek `PROMO_CODES`:
```javascript
const PROMO_CODES = {
  KODEMU: {
    code: "KODEMU",
    type: "percent",    // atau "fixed" untuk potongan nominal
    value: 0.15,        // 15% atau nominal rupiah (misal: 10000)
    minSpend: 25000,    // Minimal belanja
    maxDiscount: 20000, // Batas maksimal diskon (opsional untuk tipe percent)
    desc: "Diskon 15% minimal belanja Rp25.000"
  }
};
```

---

## 📱 Pratinjau Tampilan & Responsivitas

- **Desktop (≥ 1024px)**: Tata letak dua kolom (katalog interaktif & struk kasir permanen di sisi kanan).
- **Tablet (768px - 1023px)**: Tata letak adaptif dengan navigasi menu yang mudah dijangkau.
- **Mobile (< 768px)**: Tampilan kartu ringkas vertikal, tombol aksi ukuran sentuh (*touch-friendly*), dan navigasi hamburger responsif.

---

## 📄 Lisensi & Hak Cipta

Dibuat untuk keperluan akademik mata kuliah **Perancangan dan Pemrograman Web** (Semester 3).  
Seluruh hak cipta asset dan kode dilindungi oleh pengembang © 2024–2026 **Muhamad Ikhsan Syabani**.

