# Referensi API Lengkap: Sistem Absensi Akademik

Dokumentasi detail mengenai Endpoint, Payload, dan Response JSON.  
Semua endpoint (kecuali Login) memerlukan header: `Authorization: Bearer {token}`

---

## 🔑 1. Autentikasi (Umum)

### Login
*   **Endpoint:** `POST /api/login`
*   **Payload:**
    ```json
    {
      "identifier": "240001",
      "password": "password"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "message": "Login berhasil",
      "access_token": "1|abcde12345...",
      "token_type": "Bearer",
      "user": {
        "id": 1,
        "name": "Dosen Pengampu, S.Kom",
        "identifier": "240001",
        "role": "lecturer",
        "class": null
      }
    }
    ```

### Logout
*   **Endpoint:** `POST /api/logout`
*   **Response (200 OK):**
    ```json
    { "message": "Berhasil logout" }
    ```

---

## 🛠️ 2. API Admin (Manajemen Data)

### Import Master Data
*   **Endpoint:** `POST /api/admin/import-master`
*   **Payload (Multipart Form-Data):**
    *   `students_file`: (File .xlsx)
    *   `courses_file`: (File .xlsx)
*   **Response (200 OK):**
    ```json
    { "message": "Import data master (Dosen, Matakuliah, Pertemuan, dan Mahasiswa) berhasil dilakukan!" }
    ```

---

## 👨‍🏫 3. API User: Dosen (Lecturer)

### Daftar Mata Kuliah Diampu
*   **Endpoint:** `GET /api/lecturer/courses`
*   **Response (200 OK):**
    ```json
    {
      "message": "Daftar mata kuliah dosen",
      "data": [
        {
          "id": 1,
          "code": "VTI502",
          "name": "Pemrograman Web",
          "class": "T2A",
          "meetings_count": 16
        }
      ]
    }
    ```

### Daftar Sesi Pertemuan
*   **Endpoint:** `GET /api/lecturer/meetings/{course_id}`
*   **Response (200 OK):**
    ```json
    {
      "message": "Daftar pertemuan",
      "data": [
        {
          "id": 5,
          "title": "Pertemuan Ke-5",
          "date": "2026-05-20",
          "is_open": false,
          "open_until": null
        }
      ]
    }
    ```

### Buka Sesi Absensi Mandiri
*   **Endpoint:** `PATCH /api/lecturer/meetings/{id}/open`
*   **Payload:**
    ```json
    {
      "latitude": -7.9465,
      "longitude": 112.6156,
      "radius": 50,
      "duration": 90
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "message": "Sesi absensi berhasil dibuka",
      "data": {
        "id": 5,
        "is_open": true,
        "open_until": "2026-05-20 10:30:00",
        "radius": 50
      }
    }
    ```

### Input Absen Manual (Bypass)
*   **Endpoint:** `POST /api/lecturer/attendances/manual`
*   **Payload:**
    ```json
    {
      "meeting_id": 5,
      "student_id": 10,
      "status": "sick"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "message": "Absensi manual berhasil disimpan",
      "data": {
        "id": 100,
        "student_id": 10,
        "status": "sick",
        "marked_by": "lecturer"
      }
    }
    ```

---

## 🎓 4. API User: Mahasiswa (Student)

### Deteksi Sesi Absensi Aktif
*   **Endpoint:** `GET /api/student/meetings/active`
*   **Response (200 OK):**
    ```json
    {
      "message": "Sesi absensi aktif",
      "data": [
        {
          "id": 5,
          "course": { "name": "Pemrograman Web" },
          "latitude": -7.9465,
          "longitude": 112.6156,
          "radius": 50,
          "open_until": "2026-05-20 10:30:00"
        }
      ]
    }
    ```

### Submit Absensi Mandiri (Geofencing)
*   **Endpoint:** `POST /api/student/attendances/submit`
*   **Payload:**
    ```json
    {
      "meeting_id": 5,
      "latitude": -7.9466,
      "longitude": 112.6157
    }
    ```
*   **Response Sukses (200 OK):**
    ```json
    {
      "message": "Absensi berhasil!",
      "data": {
        "status": "present",
        "distance": 15.4,
        "marked_by": "self"
      }
    }
    ```
*   **Response Gagal (403 Forbidden - Di luar Radius):**
    ```json
    {
      "message": "Anda berada di luar radius lokasi absensi.",
      "distance": 150.5,
      "allowed_radius": 50
    }
    ```

### Riwayat Kehadiran Pribadi
*   **Endpoint:** `GET /api/student/attendances/history`
*   **Response (200 OK):**
    ```json
    {
      "message": "Riwayat kehadiran pribadi",
      "data": [
        {
          "status": "present",
          "created_at": "2026-05-20 09:15:00",
          "meeting": { "title": "Pertemuan Ke-5", "course": { "name": "Web" } }
        }
      ]
    }
    ```

---

## ⚠️ 5. Status Response Common
*   `200 OK`: Request berhasil.
*   `400 Bad Request`: Kesalahan logika (misal: absen di sesi yang sudah tutup).
*   `401 Unauthorized`: Token salah atau belum login.
*   `403 Forbidden`: Role tidak sesuai atau di luar radius lokasi.
*   `422 Unprocessable Entity`: Validasi input gagal (misal: NIM tidak ditemukan).
