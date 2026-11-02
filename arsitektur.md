# Arsitektur Daily Drip Coffee

## Struktur aplikasi

Daily Drip Coffee adalah website **single-page frontend** yang terdiri dari:

- `index.html` — struktur semantik halaman dan komponen form.
- `style.css` — tampilan, layout, responsive design, dan visual brand.
- `script.js` — interaksi menu, keranjang, validasi, perhitungan harga, dan checkout.
- `Dialy_Drip_20_Foto_Produk/` — aset foto produk dan background lokal.

## Alur halaman

```text
Navbar → Home/Hero → About brand → Menu preview dan katalog → Order / receipt / checkout → Footer
```

Navigasi utama menggunakan anchor internal: `#beranda`, `#menu`, `#pesan`, dan `#about`.

## Tanggung jawab JavaScript

1. Menu navigasi mobile.
2. Filter kategori dan preview produk.
3. Keranjang berbasis `Map`, quantity, hapus, dan catatan per produk.
4. Subtotal, sistem voucher kode promo, dan total bayar.
5. Validasi pelanggan dan pembuatan link checkout WhatsApp.

Website tidak menggunakan server, database, atau penyimpanan permanen.
