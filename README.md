# Habit Tracker App

Aplikasi pelacak kebiasaan modern yang dibangun dengan Next.js, dirancang untuk membantu pengguna mengelola aktivitas harian, memantau cuaca, dan membuat catatan dengan antarmuka yang bersih dan interaktif.

## Fitur Utama

### 1. Dashboard Interaktif
Pusat informasi harian pengguna yang mencakup:
- **Weather Widget Cerdas**: Menampilkan cuaca *real-time* menggunakan API Open-Meteo dan lokasi pengguna (Reverse Geocoding via OpenStreetMap). Background kartu berubah dinamis sesuai kondisi cuaca (hujan, cerah, malam, pagi) dan waktu.
- **Peta Aktivitas**: Integrasi peta interaktif menggunakan `react-leaflet`.
- **Timeline Harian**: Visualisasi alur aktivitas pengguna sepanjang hari.

### 2. Manajemen Kebiasaan (Habits)
Sistem pelacakan kebiasaan yang fleksibel:
- **Dua Tampilan Utama**: Mode *Week View* (tabel horizontal) untuk detail harian, dan *Month View* (kalender) untuk melihat tren jangka panjang.
- **Visualisasi Progress**: Indikator lingkaran (donut chart) pada kalender bulanan yang menunjukkan persentase penyelesaian harian.
- **Tipe Jadwal**: Mendukung kebiasaan frekuensi harian maupun periodik (beberapa kali sehari).

### 3. Catatan & Dokumen (Advanced Notes)
Editor teks kaya fitur (*Rich Text Editor*) yang dibangun dari dasar:
- **Markdown Shortcuts**: Mendukung pengetikan cepat seperti `# ` untuk Heading, `- ` untuk list, `1. ` untuk ordered list, dan `> ` untuk quotes.
- **Manajemen Gambar**: Fitur *Image Resizer* bawaan untuk mengubah ukuran gambar langsung di dalam editor.
- **Tabel & Checkbox**: Dukungan penuh untuk pembuatan tabel dan *checklist* interaktif dengan styling khusus.
- **Organisasi Workspace**: Struktur folder dan workspace untuk mengelompokkan catatan.

## Update & Status Pengembangan Saat Ini

Fokus pengembangan saat ini berada pada penyempurnaan pengalaman pengguna (UX) dan stabilitas fitur inti:
- **Rich Text Editor Engine**: Sedang dioptimalkan logika *core* `contentEditable` untuk menangani format teks yang kompleks, *drag-and-drop*, serta perbaikan *focus handling* pada elemen interaktif seperti checkbox.
- **Integrasi Lokasi & API**: Implementasi *GeoPermissionGate* untuk menangani izin lokasi browser dengan *fallback* yang mulus jika izin ditolak, serta sinkronisasi data cuaca yang efisien.
- **Real-time Updates**: Persiapan infrastruktur *real-time* menggunakan Laravel Echo & Pusher untuk sinkronisasi data antar perangkat (terlihat dari dependensi proyek).

## Teknologi yang Digunakan

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS, Tailwind Merge
- **Animasi**: Framer Motion
- **Maps**: React Leaflet
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Real-time**: Laravel Echo, Pusher JS

## Cara Menjalankan Project

Pastikan Node.js sudah terinstall di komputer Anda.

1. **Install dependensi**
   ```bash
   npm install
   ```

2. **Jalankan server development**
   ```bash
   npm run dev
   ```

3. **Buka aplikasi**
   Buka browser dan akses [http://localhost:3000](http://localhost:3000).
