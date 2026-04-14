### Tabel `meetings` (Pertemuan/Sesi Kelas)
| Kolom | Tipe Data | Deskripsi |
| :--- | :--- | :--- |
| id | bigint (PK) | |
| course_id | bigint (FK) | |
| title | varchar | Pertemuan Ke-X |
| date | date | Tanggal pertemuan |
| is_open | boolean | Status sesi mandiri aktif/tidak |
| open_until | datetime | Batas waktu sesi berakhir |
| latitude | decimal(10,8) | Lokasi Dosen saat sesi dibuka |
| longitude | decimal(11,8) | Lokasi Dosen saat sesi dibuka |
| radius | integer | Jarak maksimal (meter) untuk absensi mandiri |