# Panduan Penggunaan dan Pengembangan

## Menjalankan website

1. Pastikan folder `Dialy_Drip_20_Foto_Produk/` berada satu level dengan `index.html`.
2. Buka `index.html` menggunakan browser modern.
3. Tidak diperlukan instalasi dependency atau server backend.

## Cara memesan

1. Buka bagian **Menu** melalui navbar.
2. Pilih kategori `WHITE-MILK`, `BLACK`, `NON-COFFEE`, atau `TEA & OTHERS`.
3. Klik kartu produk untuk melihat preview foto, komposisi, dan harga.
4. Klik tombol `+` pada preview untuk memasukkan produk ke keranjang.
5. Atur jumlah menggunakan tombol `+`, `-`, atau hapus pada struk.
6. Tambahkan catatan khusus jika diperlukan.
7. Isi nama, nomor WhatsApp, dan metode `Pickup` atau `Delivery`.
8. Klik **Checkout pesanan**, periksa ringkasan, lalu klik **Kirim ke WhatsApp**.

## Mengubah konten

- Data produk, harga, foto, dan komposisi berada di `script.js` pada bagian `productData`.
- Nomor WhatsApp toko berada pada konstanta `NOMOR_WHATSAPP_TOKO`.
- Struktur dan teks section berada di `index.html`.
- Warna, layout, dan responsive design berada di `style.css`.

Website frontend-only. Data dihitung di browser dan dikirim melalui link WhatsApp, bukan server aplikasi.
