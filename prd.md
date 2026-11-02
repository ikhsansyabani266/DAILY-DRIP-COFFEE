# PRD — Daily Drip Coffee

## 1. Tujuan Produk

Membangun website coffee shop single-page yang clean, editorial, hangat, dan mudah digunakan untuk menemukan minuman serta melakukan pemesanan melalui WhatsApp.

## 2. Target Pengguna

Pelanggan yang ingin:

- Melihat katalog minuman dengan cepat.
- Memilih produk berdasarkan kategori.
- Mengatur jumlah dan catatan pesanan.
- Mengetahui total serta diskon sebelum checkout.
- Memesan melalui desktop maupun mobile.

## 3. Konsep Brand

Alur pengalaman website mengikuti tema:

```text
Start with coffee → Find your drip → Make it yours → The Daily Drip Story
```

Visual menggunakan konsep coffee journal dengan palet espresso, caramel, cream, sand, dan orange.

## 4. Fitur Utama

- Navbar responsive dengan anchor `Home`, `About`, `Menu`, dan `Order`.
- Hero minimal dengan headline brand.
- Preview produk berupa foto, kategori, komposisi, harga, dan tombol tambah `+`.
- Empat kategori menu.
- Katalog 20 minuman.
- Keranjang dinamis dengan quantity dan hapus produk.
- Catatan khusus untuk setiap produk.
- Subtotal dan potongan diskon berbasis kode promo.
- Validasi nama dan nomor WhatsApp.
- Pilihan metode `Pickup` atau `Delivery`.
- Ringkasan checkout dan link WhatsApp.
- About section dengan layout dua kolom foto dan informasi brand.
- Responsive layout untuk desktop dan mobile.

## 5. Batasan

Frontend-only tanpa backend, database, framework, payment gateway, atau dependency eksternal.

## 6. Kriteria Penerimaan

- Semua anchor navigasi menuju section yang benar.
- Filter kategori menampilkan produk yang sesuai.
- Preview produk berubah saat kartu dipilih.
- Tombol `+` menambahkan produk ke keranjang.
- Quantity, catatan, subtotal, diskon, dan total bekerja benar.
- Form menampilkan validasi ketika data belum sesuai.
- Link WhatsApp memuat detail pelanggan dan pesanan.
- Tampilan tetap usable pada desktop dan mobile.