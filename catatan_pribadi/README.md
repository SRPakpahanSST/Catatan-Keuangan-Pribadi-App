# 📝 Aplikasi Catatan Pribadi (Personal Notes App)

Aplikasi web sederhana untuk mencatat ide, tugas, atau hal penting lainnya. Dibangun dengan **React** sebagai front-end framework, menggunakan pendekatan **controlled component** untuk form, serta mendukung fitur pencarian, pengarsipan, dan pengelompokan catatan per bulan/tahun.

Aplikasi ini merupakan proyek akhir dari kelas **Belajar Membangun Aplikasi Web dengan React** di Dicoding, dan memenuhi seluruh kriteria **Advanced** (penguasaan array function, reusable component, state & event management, controlled form).

Deploy URL Link ke Vercel:
https://my-personal-notes-app-187q.vercel.app

Hasil deploy: https://my-personal-notes-app-gamma.vercel.app/

## ✨ Fitur Unggulan

- ✅ **Tambah Catatan** – Form input judul dan isi dengan validasi:
  - Judul maksimal 50 karakter, disertai **counter sisa karakter**.
  - Isi catatan minimal 10 karakter, jika kurang akan muncul pesan error.
- 🔍 **Pencarian Catatan** – Cari catatan berdasarkan judul atau isi (case-insensitive), hasil langsung terfilter.
- 📂 **Arsip & Aktif** – Catatan dapat dipindahkan ke arsip atau dikembalikan ke daftar aktif.
- 📅 **Pengelompokan Otomatis** – Catatan dikelompokkan berdasarkan bulan dan tahun (contoh: *April 2025*), diurutkan dari terbaru.
- 🖍️ **Sorot Kata Kunci** – Saat melakukan pencarian, kata kunci yang cocok akan ditandai dengan elemen `<mark>` pada judul dan isi.
- 🗑️ **Hapus Catatan** – Tombol hapus untuk menghapus catatan permanen.

## 🛠️ Teknologi yang Digunakan

- **React** (Create React App / Vite)
- **JavaScript (ES6+)**
- **CSS3** (styling disediakan oleh starter project)
- **Node.js** (environment untuk development)

## 🚀 Cara Menjalankan Aplikasi

### Prasyarat
- **Node.js** versi 18 atau lebih tinggi
- **npm** (biasanya sudah termasuk Node.js)

