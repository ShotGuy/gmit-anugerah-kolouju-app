# Admin System Management Components

Kumpulan komponen lengkap untuk mengelola dan memonitor sistem, database, dan storage S3 di admin dashboard.

## Komponen

### 1. SystemInfo
Komponen untuk menampilkan informasi sistem real-time:
- **System Status**: Status kesehatan sistem, uptime, load average
- **CPU Usage**: Penggunaan CPU dengan progress bar dan informasi core
- **Memory Usage**: Penggunaan RAM dengan detail used/total
- **Disk Usage**: Penggunaan storage disk
- **Network Activity**: Statistik network bytes/packets sent/received
- **System Details**: Platform, architecture, hostname, Node.js version

### 2. DatabaseInfo
Komponen untuk monitoring database PostgreSQL:
- **Connection Pool**: Total, active, idle, dan maksimum connections
- **Performance Metrics**: Query execution statistics
- **Table Statistics**: Size, operations (insert/update/delete), live/dead tuples
- **Database Info**: Version, size, encoding, collation

### 3. S3Browser
Komponen untuk mengelola file di AWS S3:
- **File Browser**: Navigate folder structure dengan breadcrumb
- **File Upload**: Upload multiple files dengan progress
- **File Management**: Download, preview, delete files
- **Search**: Cari file berdasarkan nama
- **File Icons**: Icon berbeda berdasarkan tipe file

### 4. AdminSystemDashboard
Komponen utama dengan tab navigation untuk mengakses semua fitur sistem.

## API Endpoints

### System Info
- `GET /api/admin/system-info` - Mendapatkan informasi sistem

### Database Info  
- `GET /api/admin/database-info` - Mendapatkan informasi database

### S3 Management
- `GET /api/admin/s3/objects` - List files dan folders
- `POST /api/admin/s3/upload` - Upload file ke S3
- `POST /api/admin/s3/delete` - Delete file dari S3
- `GET /api/admin/s3/download` - Download file dari S3

## Instalasi

### 1. Install Dependencies
```bash
npm install @aws-sdk/client-s3
```

### 2. Environment Variables
Tambahkan ke `.env.local`:
```env
# AWS S3 Configuration
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

### 3. Database Setup
Pastikan PostgreSQL memiliki extension untuk monitoring:
```sql
-- Enable pg_stat_statements untuk query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

## Usage

### Import Komponen
```jsx
import AdminSystemDashboard from '@/components/system/AdminSystemDashboard';

// Atau import individual
import { SystemInfo, DatabaseInfo, S3Browser } from '@/components/system';
```

### Penggunaan di Page
```jsx
export default function AdminSystemPage() {
  return (
    <AdminLayout>
      <AdminSystemDashboard />
    </AdminLayout>
  );
}
```

## Features

### Real-time Monitoring
- Auto-refresh setiap 30 detik untuk data sistem dan database
- Real-time clock display
- Live system metrics

### File Management
- Upload multiple files sekaligus
- Drag & drop support (bisa ditambahkan)
- File preview untuk gambar
- Batch delete operations
- Search dan filter files

### Security
- Admin role authentication required
- Server-side validation untuk semua operations
- Secure S3 operations dengan proper credentials

### Responsive Design
- Mobile-friendly layout
- Dark mode support
- Consistent dengan design system admin dashboard

## Customization

### Menambah Metrics Baru
Edit `/api/admin/system-info.js` untuk menambah metrics:
```javascript
const customMetrics = {
  // Custom system metrics
  processMemory: process.memoryUsage(),
  activeHandles: process._getActiveHandles?.()?.length || 0,
};
```

### Custom Database Queries
Edit `/api/admin/database-info.js` untuk monitoring custom:
```javascript
const customStats = await prisma.$queryRaw`
  SELECT * FROM custom_monitoring_view
`;
```

### S3 Custom Operations
Tambah operations baru di folder `/api/admin/s3/`:
- `rename.js` - Rename file
- `move.js` - Move file antar folder
- `create-folder.js` - Create new folder

## Troubleshooting

### Common Issues

1. **S3 Connection Error**
   - Pastikan AWS credentials benar
   - Check bucket permissions
   - Verify region setting

2. **Database Monitoring Error**
   - Install `pg_stat_statements` extension
   - Check database permissions
   - Verify connection string

3. **System Metrics Not Loading**
   - Check Node.js permissions
   - Verify OS compatibility
   - Check for missing system commands

### Performance Tips

1. **Optimize Queries**
   - Index tables yang sering di-query
   - Limit result sets untuk large tables
   - Use connection pooling

2. **S3 Optimization**  
   - Use presigned URLs untuk large files
   - Implement pagination untuk folder besar
   - Cache folder structure

3. **Frontend Optimization**
   - Implement virtual scrolling untuk large lists
   - Debounce search queries
   - Use React.memo untuk expensive components

## Contributing

1. Ikuti coding standards yang ada
2. Tambahkan tests untuk fitur baru
3. Update dokumentasi
4. Test di berbagai browser dan device sizes