# Sistem Manajemen Kas & Iuran RT- Frontend UI

Repositori ini berisi kode sumber frontend berbasis Single Page Application (SPA) yang dibangun menggunakan React, TypeScript, dan Tailwind CSS. Aplikasi ini terhubung secara terpisah ke backend API Laravel.

## 🛠️ Prasyarat (Prerequisites)

Sebelum memulai instalasi, pastikan Anda sudah memasang perangkat lunak berikut di komputer Anda:

- Node.js (Versi LTS direkomendasikan, e.g., v18+ atau v20+)
- npm (Bawaan setelah menginstal Node.js) atau yarn

## 🚀 Panduan Instalasi

Ikuti langkah-langkah berikut untuk menjalankan aplikasi frontend di lingkungan lokal Anda:

### 1. Klon Repositori

```bash
git clone https://github.com/crashbug01/rtmanagementfrontend.git
cd rtmanagementfrontend
```

### 2. Instal Dependensi Node.js

```bash
npm install
```

### 3. Konfigurasi Environment File

Buat file bernama .env di root folder proyek Anda (sejajar dengan package.json), lalu masukkan konfigurasi endpoint yang mengarah ke API Laravel lokal:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

### 4. Jalankan Server Development Lokal

```bash
npm run dev
```

Setelah berhasil berjalan, buka peramban (browser) Anda dan akses URL yang tertera di terminal Anda, biasanya di: http://localhost:5173

## 🌐 Koneksi API & Axios

Aplikasi ini berkomunikasi dengan backend menggunakan pustaka Axios. Konfigurasi instance global berada pada direktori src/util/api.ts (atau sesuai path proyek Anda).

Secara otomatis, instansiasi Axios ini akan:

- Membaca VITE_API_BASE_URL dari file .env.

- Menyisipkan Bearer Token yang tersimpan di localStorage ke dalam header HTTP setiap kali aplikasi melakukan request data yang membutuhkan proteksi keamanan.

Contoh penulisan struktur pemanggilan API pada komponen form/tabel:

```
import api from "./path/ke/util/api";

// Cukup panggil endpoint relatifnya, baseURL otomatis terpasang
api.get('/expenses')
   .then(response => console.log(response.data))
   .catch(error => console.error(error));
```
