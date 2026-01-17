# Guide Implementasi Jadwal Ibadah Real

## Overview

Sistem jadwal ibadah telah berhasil diimplementasi dengan data real dari database, menggantikan data dummy sebelumnya. Sistem ini mendukung **filter berdasarkan jenis ibadah** dan **kategori jadwal**.

## 🔓 API Public untuk Jadwal Ibadah

### Endpoint
```
GET /api/public/jadwal-ibadah
```

### Query Parameters
- `jenisIbadah` (string) - Filter berdasarkan jenis ibadah (e.g., "Ibadah Minggu", "Ibadah Rabu")
- `kategori` (string) - Filter berdasarkan kategori (e.g., "Rayon", "Keluarga", "Khusus")  
- `limit` (number) - Jumlah maksimal data (default: 10)
- `upcoming` (boolean) - Hanya jadwal yang akan datang (default: true)

### Contoh Penggunaan
```bash
# Semua jadwal
GET /api/public/jadwal-ibadah

# Filter berdasarkan jenis ibadah
GET /api/public/jadwal-ibadah?jenisIbadah=Ibadah%20Minggu%20Pagi

# Filter berdasarkan kategori
GET /api/public/jadwal-ibadah?kategori=Rayon

# Kombinasi filter
GET /api/public/jadwal-ibadah?jenisIbadah=Ibadah%20Keluarga&limit=6
```

### Response Format
```json
{
  "success": true,
  "data": {
    "schedules": [
      {
        "id": "jdw_...",
        "title": "Ujian Tengah Semester", 
        "jenisIbadah": "Cell Group/Kelompok Kecil",
        "kategori": "Keluarga",
        "date": "Rabu, 10 September 2025",
        "time": "04:03",
        "location": "Parkir Timur Senayan", 
        "speaker": "Fuga Aperiam offici",
        "tema": "adf",
        "firman": "adf",
        "rayon": "Rayon I"
      }
    ],
    "groupedByJenis": {...},
    "filters": {
      "jenisIbadah": [...],
      "kategori": [...]
    },
    "meta": {
      "total": 1,
      "filtered": {...}
    }
  }
}
```

## 📱 Komponen Frontend

### ScheduleRow Component
Komponen utama untuk menampilkan jadwal ibadah dengan slider.

**Props:**
- `jenisIbadah` (string) - Filter berdasarkan jenis ibadah
- `kategori` (string) - Filter berdasarkan kategori  
- `title` (string) - Judul untuk row (default: "Schedule")
- `limit` (number) - Jumlah data maksimal (default: 6)

**Contoh Penggunaan:**
```jsx
<ScheduleRow 
  jenisIbadah="Ibadah Minggu" 
  title="Jadwal Ibadah Minggu" 
  limit={4} 
/>

<ScheduleRow 
  kategori="Rayon" 
  title="Jadwal Ibadah Rayon" 
  limit={6} 
/>
```

### ScheduleCard Component  
Komponen kartu untuk menampilkan detail jadwal individual.

**Props:**
- `title` (string) - Judul jadwal
- `date` (string) - Tanggal ibadah  
- `time` (string) - Waktu ibadah
- `location` (string) - Lokasi ibadah
- `speaker` (string) - Pemimpin ibadah
- `tema` (string) - Tema ibadah (optional)
- `firman` (string) - Firman/ayat (optional) 
- `rayon` (string) - Nama rayon (optional)

## 🎯 Implementasi di Homepage

Halaman utama sekarang menggunakan 3 row jadwal dengan filter berbeda:

```jsx
// src/pages/index.js
<ScheduleRow 
  jenisIbadah="Ibadah Minggu" 
  title="Jadwal Ibadah Minggu" 
  limit={4} 
/>
<ScheduleRow 
  kategori="Rayon" 
  title="Jadwal Ibadah Rayon" 
  limit={6} 
/>
<ScheduleRow 
  jenisIbadah="Ibadah Rabu" 
  title="Jadwal Ibadah Rabu" 
  limit={4} 
/>
```

## 🔧 Service Layer

### PublicJadwalService
Service untuk mengambil data jadwal dari API public.

**Methods:**
- `getJadwalIbadah(filters)` - Get jadwal dengan filter
- `getJadwalByJenis(jenisIbadah, limit)` - Get jadwal berdasarkan jenis
- `getJadwalRayon(limit)` - Get jadwal rayon  
- `getJadwalMingguan(limit)` - Get jadwal mingguan
- `getJadwalKhusus(limit)` - Get jadwal khusus
- `getAvailableFilters()` - Get semua filter tersedia
- `formatForScheduleRow(apiData)` - Format data untuk komponen
- `groupByJenisIbadah(schedules)` - Group schedules berdasarkan jenis

## 📊 Data Real dari Database

Sistem mengambil data dari tabel-tabel berikut:
- `jadwal_ibadah` - Jadwal utama
- `jenis_ibadah` - Jenis ibadah (Minggu, Rabu, Pemuda, dll)
- `kategori_jadwal` - Kategori (Rayon, Keluarga, Khusus, dll)
- `jemaat` - Data pemimpin ibadah
- `rayon` - Data rayon untuk ibadah rayon
- `keluarga` - Data keluarga untuk ibadah keluarga

## 🔒 Keamanan

- ✅ **API Public** - Tanpa autentikasi, aman untuk konsumsi publik
- ✅ **Data Filtering** - Hanya data yang appropriate untuk publik
- ✅ **CORS Enabled** - Dapat diakses dari frontend
- ✅ **No Sensitive Data** - Tidak mengekspos data personal sensitif

## 🎨 UI/UX Features  

### Loading States
- Loading spinner saat memuat data
- "Memuat jadwal..." text

### Error Handling  
- Error message jika API gagal
- Fallback untuk data kosong
- "Tidak ada jadwal X yang akan datang"

### Interactive Elements
- Slider navigation (prev/next)
- Auto-rotation setiap 10 detik
- Responsive design (mobile + desktop)

### Card Information
- 📅 Tanggal dan waktu
- 📍 Lokasi ibadah
- 🎤 Pemimpin ibadah  
- 👥 Rayon (jika applicable)
- 📖 Firman Tuhan (jika ada)
- 💭 Tema ibadah (jika ada)

## 📚 Available Jenis Ibadah

Sistem mendukung berbagai jenis ibadah:
- Ibadah Minggu Pagi/Sore
- Ibadah Rabu/Doa Pagi/Doa Malam
- Ibadah Pemuda/Remaja/Anak
- Ibadah Keluarga/Cell Group  
- Ibadah Khusus (Natal, Paskah, dll)
- Pelayanan & Persekutuan
- Dan lainnya...

## 🏷️ Available Kategori

- **Mingguan** - Ibadah rutin mingguan
- **Rayon** - Ibadah per rayon/wilayah  
- **Keluarga** - Ibadah keluarga dan anak
- **Khusus** - Acara dan perayaan khusus
- **Persekutuan** - Kelompok kecil
- **Pelayanan** - Kegiatan pelayanan
- **Pelatihan** - Seminar dan pengembangan
- **Remaja** - Khusus remaja dan pemuda

## ✅ Status Implementation

- [x] API Public untuk jadwal ibadah
- [x] Service layer untuk frontend  
- [x] ScheduleRow component dengan data real
- [x] ScheduleCard component enhanced
- [x] Filter berdasarkan jenis ibadah
- [x] Filter berdasarkan kategori
- [x] Integration di homepage
- [x] Loading & error states
- [x] Responsive design
- [x] Auto-rotation slider

Sistem jadwal ibadah sekarang **100% menggunakan data real** dari database dengan **filtering yang fleksibel** berdasarkan jenis ibadah dan kategori! 🎉