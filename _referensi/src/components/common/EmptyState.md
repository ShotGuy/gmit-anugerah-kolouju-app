# EmptyState Component Documentation

Komponen EmptyState yang dapat digunakan kembali untuk menampilkan keadaan kosong di aplikasi GMIT Imanuel Oepura.

## Features

- ✅ **Multiple Types**: 9 predefined types (default, search, users, calendar, gallery, books, inbox, error, nodata)
- ✅ **Responsive Sizes**: 3 ukuran (sm, md, lg)
- ✅ **Custom Icons**: Support untuk icon custom atau icon bawaan
- ✅ **Action Button**: Optional button dengan callback
- ✅ **Animated**: Smooth CSS animations
- ✅ **DaisyUI Integration**: Menggunakan DaisyUI styling
- ✅ **Predefined Variants**: Helper components untuk use case umum

## Basic Usage

```jsx
import EmptyState from "@/components/common/EmptyState";

// Basic usage
<EmptyState />

// With type
<EmptyState type="users" />

// With action button
<EmptyState
  type="users"
  actionText="Tambah Jemaat"
  onAction={() => handleAddUser()}
/>
```

## Props

| Prop          | Type        | Default     | Description                                 |
| ------------- | ----------- | ----------- | ------------------------------------------- |
| `icon`        | `Component` | `undefined` | Custom icon component                       |
| `title`       | `string`    | `undefined` | Custom title (overrides type default)       |
| `description` | `string`    | `undefined` | Custom description (overrides type default) |
| `actionText`  | `string`    | `undefined` | Text untuk action button                    |
| `onAction`    | `function`  | `undefined` | Callback untuk action button                |
| `type`        | `string`    | `"default"` | Predefined type                             |
| `size`        | `string`    | `"md"`      | Size variant (sm, md, lg)                   |
| `className`   | `string`    | `""`        | Additional CSS classes                      |

## Types

### Available Types

1. **`default`** - General empty state
2. **`search`** - Empty search results
3. **`users`** - No users/jemaat
4. **`calendar`** - No events/schedules
5. **`gallery`** - No images
6. **`books`** - No documents
7. **`inbox`** - No messages
8. **`error`** - Error state
9. **`nodata`** - Data not found

## Sizes

- **`sm`** - Small (py-8, icon w-12 h-12)
- **`md`** - Medium (py-12, icon w-16 h-16) - Default
- **`lg`** - Large (py-16, icon w-20 h-20)

## Predefined Variants

```jsx
import { EmptyStates } from "@/components/common/EmptyState";

<EmptyStates.NoData />
<EmptyStates.NoSearch />
<EmptyStates.NoUsers />
<EmptyStates.NoCalendar />
<EmptyStates.NoGallery />
<EmptyStates.NoBooks />
<EmptyStates.NoInbox />
<EmptyStates.Error />
<EmptyStates.NotFound />
```

## Real World Examples

### 1. Jemaat List Empty

```jsx
<EmptyState
  type="users"
  title="Belum Ada Data Jemaat"
  description="Anda belum memiliki data jemaat yang terdaftar. Mulai dengan menambahkan jemaat pertama."
  actionText="Tambah Jemaat"
  onAction={() => router.push("/jemaat/create")}    
/>
```

### 2. Search Results Empty

```jsx
<EmptyState
  type="search"
  title="Tidak Ditemukan Hasil"
  description={`Pencarian untuk "${searchQuery}" tidak menghasilkan hasil apapun.`}
/>
```

### 3. Gallery Empty

```jsx
<EmptyState
  type="gallery"
  actionText="Upload Foto"
  onAction={() => setShowUploadModal(true)}
  size="lg"
/>
```

### 4. Error State

```jsx
<EmptyState
  type="error"
  title="Gagal Memuat Data"
  description="Terjadi kesalahan saat memuat data. Silakan coba lagi."
  actionText="Coba Lagi"
  onAction={() => refetch()}
/>
```

## Integration Examples

### With React Query

```jsx
function JemaatList() {
  const { data, isLoading, error } = useQuery(["jemaat"], fetchJemaat);

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    return (
      <EmptyState
        type="error"
        actionText="Coba Lagi"
        onAction={() => refetch()}
      />
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        type="users"
        actionText="Tambah Jemaat"
        onAction={() => router.push("/jemaat/create")}
      />
    );
  }

  return <JemaatTable data={data} />;
}
```

### With Search

```jsx
function SearchResults({ results, searchQuery }) {
  if (results.length === 0 && searchQuery) {
    return (
      <EmptyState
        type="search"
        title="Tidak Ada Hasil"
        description={`Pencarian "${searchQuery}" tidak ditemukan.`}
      />
    );
  }

  return <ResultsList results={results} />;
}
```

## Styling

Component menggunakan DaisyUI classes dan custom CSS animations:

- **DaisyUI**: `btn`, `btn-primary`, `text-base-content`
- **Custom animations**: `animate-fade-in`, `animate-bounce-in`, `animate-slide-up`
- **Hover effects**: `hover:scale-110`, `transition-transform`

## Animations

Component menggunakan CSS animations yang didefinisikan di `globals.css`:

```css
.animate-fade-in {
  animation: fade-in 0.5s ease-out;
}
.animate-bounce-in {
  animation: bounce-in 0.6s ease-out 0.1s both;
}
.animate-slide-up {
  animation: slide-up 0.4s ease-out 0.2s both;
}
```

## Tips

1. **Gunakan type yang sesuai** untuk mendapatkan icon dan pesan default yang tepat
2. **Tambahkan action button** untuk memberikan next step yang jelas
3. **Custom title/description** untuk context yang lebih spesifik
4. **Gunakan size yang sesuai** dengan layout halaman
5. **Combine dengan loading states** untuk UX yang lebih baik
