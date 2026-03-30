# Status Pengembangan & Daftar Tugas Pending (27 Maret 2026)

Dokumen ini merangkum hal-hal yang sudah diimplementasikan dan bagian yang masih memerlukan integrasi atau perbaikan lebih lanjut.

---

## 1. Detail Service Page
**Status:** UI sudah terintegrasi data API, namun fungsionalitas pengiriman data masih dalam tahap simulasi.

### **Pending Tasks:**
* [ ] **Integrasi API Form:** Saat ini `ContactForm.tsx` baru mempersiapkan `FormData` dan menampilkannya di `console.log`. Perlu dihubungkan ke endpoint API Backend yang sesungguhnya.
* [ ] **Submit State Handling:** Menambahkan UI loading saat submit, pesan sukses (success toast/modal), dan penanganan error jika API gagal.
* [ ] **Cleanup UI Consistency:**
    - Memastikan semua file di `detail_service_components` benar-benar bersih dari kelas `blue-x` (beberapa komponen seperti `BannerSection` dan `PromoSection` masih menggunakan prop `type='blue'`).
    - Melanjutkan penggantian `font-bold` ke `font-semibold` pada komponen yang terlewat (misal: `ProcessSection.tsx`).
* [ ] **Handling File Upload:** Memastikan backend siap menerima multipart/form-data untuk file portfolio.

---

## 2. Author Page
**Status:** Data profil dan filter peran sudah dinamis dari API.

### **Pending Tasks:**
* [ ] **Handling Halaman Kosong (Not Found):** Jika slug author tidak ditemukan atau data API kosong, perlu dipastikan halaman menampilkan state "Not Found" atau redirect yang lebih user-friendly daripada sekadar layar putih.
* [ ] **Author Articles Data:** Masih terdapat `TODO: author articles data` di `app/[locale]/(main)/author/[slug]/page.tsx`. Data artikel penulis perlu ditampilkan secara dinamis.
* [ ] **Specialization Data:** Mengintegrasikan data spesialisasi penulis ke dalam tab profil.
* [ ] **Role Filter Logic:** Memastikan jika API mengembalikan peran yang belum pernah ada sebelumnya, UI filter tetap tampil rapi (handling overflow pada list filter).

---

## 3. Information Central (Company)
**Status:** Beberapa halaman sudah menggunakan `DynamicPage`, namun sisanya masih statis.

### **Pending Tasks:**
* [ ] **Jakarta & Malang Office:** Halaman `company/jakarta-office` dan `company/malang-office` masih berupa placeholder statis (copy-paste dari About Us). Perlu integrasi data real atau dialihkan ke rute yang sudah ada.
* [ ] **Full CMS Integration:** Halaman **Benefit**, **Brand Identity**, dan **Press Release** masih menggunakan file translasi JSON manual. Perlu diubah menggunakan pola `DynamicPage` agar konten bisa dikelola 100% dari CMS.
* [ ] **Footer Sanity Check:** Memastikan semua tautan di Footer sudah tidak ada yang mengarah ke 404, terutama setelah perubahan rute `/company/press-release` menjadi `/press-release`.

---

## 4. General Enhancements
* [ ] **Global Bold Override:** Masih perlu pengecekan menyeluruh pada elemen `dangerouslySetInnerHTML` untuk memastikan semua tag `<strong>` dan `<b>` dari API dirender sebagai `font-semibold`.
* [ ] **360 Package Condition:** Saat ini kondisi slug `360-digital-marketing` di-hardcode. Jika ke depannya ada paket serupa, pertimbangkan untuk menambahkan flag khusus di API/CMS agar tidak perlu hardcode slug di frontend.