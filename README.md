# Ibadah Planner - SMP Islam Modern Al Fakhir

Aplikasi pencatatan ibadah (Mutaba'ah Yaumiyyah) untuk Siswa dan Admin.

## Fitur Utama

- **Dashboard Siswa**: Profil personal, upload foto profil (maks 1MB), dan riwayat laporan.
- **Form Ibadah**: Input shalat fardhu, sunnah, tilawah, murojaah, dan checklist akhlak.
- **Dashboard Admin**: Rekapitulasi laporan seluruh siswa per kelas/tanggal.
- **Pengaturan Dinamis**: Admin dapat mengubah daftar soal/checklist per tingkat kelas (7, 8, 9).
- **PWA Ready**: Bisa diinstall di Android/iOS sebagai aplikasi mandiri.

## Cara Deployment (Onlinekan)

Aplikasi ini sudah siap untuk di-deploy ke **Vercel**.

### 1. Persiapan Database

Vercel membutuhkan database PostgreSQL online. Anda bisa menggunakan:

- **Vercel Postgres** (Bawaan Vercel - Sangat Disarankan)
- **Supabase** (Gratis)
- **Railway**

### 2. Langkah di Vercel

1. Masuk ke [Vercel.com](https://vercel.com) menggunakan akun GitHub.
2. Klik **"Add New Project"** dan pilih repository `app-ibadah-alfakhir`.
3. Di bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL`: URL dari database online Anda.
   - `NEXTAUTH_SECRET`: Bisa diisi acak (contoh: `alfakhir-rahasia-123`).
   - `NEXTAUTH_URL`: URL aplikasi Anda (contoh: `https://app-ibadah.vercel.app`).
4. Klik **Deploy**.

### 3. Setup Database Awal

Setelah berhasil dideploy, buka terminal di komputer Anda dan jalankan:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

_(Pastikan mengganti isi `.env` di komputer lokal sementara ke URL database online saat menjalankan perintah di atas)_

## Login Default (Setelah Seeding)

- **Admin**: NIS `admin` | Password `admin123`
- **Siswa (Contoh)**: NIS `2025001` | Password `5001` (4 angka terakhir NIS)

---

© 2026 SMP Islam Modern Al Fakhir
