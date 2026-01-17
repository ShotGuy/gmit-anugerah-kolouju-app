# API Security Implementation Guide

## Overview

API di sistem GMIT Imanuel Oepura dibagi menjadi dua kategori:
1. **Public API** - Dapat diakses tanpa autentikasi (untuk halaman publik)
2. **Private API** - Memerlukan autentikasi dan otorisasi berdasarkan role

## Middleware yang Tersedia

### Public Endpoints
```javascript
import { publicEndpoint } from '@/lib/apiMiddleware';

// Untuk endpoint yang bisa diakses publik
export default publicEndpoint(handler);
```

### Private Endpoints
```javascript
import { privateEndpoint, adminOnly, majelisOrAdmin, staffOnly } from '@/lib/apiMiddleware';

// Untuk endpoint yang memerlukan autentikasi semua role
export default privateEndpoint(handler);

// Hanya admin
export default adminOnly(handler);

// Admin dan majelis saja
export default majelisOrAdmin(handler);

// Admin, majelis, dan employee
export default staffOnly(handler);
```

## Implementasi per Kategori API

### 1. Public API (folder: `/api/public/`)
- **Lokasi**: `src/pages/api/public/`
- **Akses**: Tanpa autentikasi
- **Data**: Hanya data non-sensitif untuk publik
- **Contoh**: 
  - `/api/public/statistics` - Statistik gereja untuk homepage
  - `/api/public/schedule` - Jadwal ibadah untuk publik
  - `/api/public/announcements` - Pengumuman publik

### 2. Admin Only API
Endpoint yang hanya bisa diakses admin:
```javascript
// Contoh: src/pages/api/users/index.js
import { adminOnly } from '@/lib/apiMiddleware';
export default adminOnly(handler);
```

**Endpoint yang menggunakan `adminOnly`**:
- `/api/users/*` - Manajemen user
- `/api/admin/*` - Semua endpoint admin
- `/api/system/*` - Setting sistem

### 3. Staff API (Admin + Majelis + Employee)
```javascript
import { staffOnly } from '@/lib/apiMiddleware';
export default staffOnly(handler);
```

**Endpoint yang menggunakan `staffOnly`**:
- `/api/jemaat/*` - CRUD data jemaat
- `/api/keluarga/*` - CRUD data keluarga
- `/api/baptis/*` - Data baptis
- `/api/sidi/*` - Data sidi
- `/api/statistics/*` - Statistik internal

### 4. Majelis atau Admin API
```javascript
import { majelisOrAdmin } from '@/lib/apiMiddleware';
export default majelisOrAdmin(handler);
```

**Endpoint yang menggunakan `majelisOrAdmin`**:
- `/api/jadwal-ibadah/*` - Manajemen jadwal ibadah
- `/api/majelis/*` - Data majelis
- `/api/laporan/*` - Generate laporan

### 5. Authenticated API (semua role)
```javascript
import { privateEndpoint } from '@/lib/apiMiddleware';
export default privateEndpoint(handler);
```

**Endpoint yang menggunakan `privateEndpoint`**:
- `/api/auth/me` - Profile user
- `/api/auth/logout` - Logout
- `/api/profile/*` - Manajemen profile

## Data yang Boleh di Public API

### ✅ AMAN untuk publik:
- Statistik agregat (total jemaat, total keluarga, dll)
- Jadwal ibadah umum
- Pengumuman publik
- Data geografis umum
- Info kontak gereja

### ❌ TIDAK BOLEH di public:
- Data personal jemaat (nama, alamat, telepon)
- Data keuangan
- Data internal organisasi
- Password/token
- Data sensitif keluarga
- Nomor induk/identitas

## Contoh Implementation

### Public Statistics API
```javascript
// src/pages/api/public/statistics.js
import { publicEndpoint } from '@/lib/apiMiddleware';

async function handler(req, res) {
  // Hanya return data agregat tanpa detail personal
  const stats = {
    totalJemaat: await prisma.jemaat.count(),
    totalKeluarga: await prisma.keluarga.count()
  };
  res.json(stats);
}

export default publicEndpoint(handler);
```

### Private Admin API
```javascript
// src/pages/api/users/index.js
import { adminOnly } from '@/lib/apiMiddleware';

async function handler(req, res) {
  // Full access to user data for admin
  const users = await prisma.user.findMany({
    include: { jemaat: true }
  });
  res.json(users);
}

export default adminOnly(handler);
```

## Security Headers

Public API secara otomatis mendapat CORS headers:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
```

Private API memerlukan Bearer token di header:
```javascript
Authorization: Bearer <jwt_token>
```

## Error Responses

- **401 Unauthorized**: Token tidak valid/tidak ada
- **403 Forbidden**: Role tidak memiliki akses
- **405 Method Not Allowed**: Method tidak diizinkan (public API hanya GET)

## Migration Guide

Untuk endpoint existing yang perlu diamankan:

1. Import middleware yang sesuai
2. Wrap handler dengan middleware
3. Test akses sesuai role
4. Update dokumentasi API

```javascript
// Before
export default createApiHandler({ GET: handleGet });

// After  
import { staffOnly } from '@/lib/apiMiddleware';
export default staffOnly(createApiHandler({ GET: handleGet }));
```