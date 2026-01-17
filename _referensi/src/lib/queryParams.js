// lib/queryParams.js

export function parseQueryParams(query, options = {}) {
  const {
    searchField = "nama", // default field for search
    defaultSortBy = "id",
    defaultSortOrder = "asc",
    defaultLimit = 1000,
    defaultPage = 1,
  } = options;

  const page = parseInt(query.page) || defaultPage;
  const limit = parseInt(query.limit) || defaultLimit;
  const skip = (page - 1) * limit;

  const search = query.search || "";
  const sortBy = query.sortBy || defaultSortBy;
  const sortOrder = query.sortOrder || defaultSortOrder;

  // Build where clause with search and filters
  let where = {};

  // Add search functionality
  if (search) {
    where[searchField] = {
      contains: search,
      mode: "insensitive",
    };
  }

  // Add filters
  const filters = parseFilters(query);
  where = { ...where, ...filters };

  return {
    pagination: { page, limit, skip },
    sort: { sortBy, sortOrder },
    where,
  };
}

// Parse filters from query parameters
function parseFilters(query) {
  const where = {};

  // Direct jemaat fields
  if (query.jenisKelamin !== undefined) {
    where.jenisKelamin = query.jenisKelamin === "true";
  }

  if (query.status) {
    // Handle array of status values
    if (Array.isArray(query.status)) {
      where.status = { in: query.status };
    } else {
      where.status = query.status;
    }
  }

  if (query.golonganDarah) {
    // Handle array of blood types
    if (Array.isArray(query.golonganDarah)) {
      where.golonganDarah = { in: query.golonganDarah };
    } else {
      where.golonganDarah = query.golonganDarah;
    }
  }

  // Date range filters
  if (query.tanggalLahirFrom || query.tanggalLahirTo) {
    where.tanggalLahir = {};
    if (query.tanggalLahirFrom) {
      where.tanggalLahir.gte = new Date(query.tanggalLahirFrom);
    }
    if (query.tanggalLahirTo) {
      where.tanggalLahir.lte = new Date(query.tanggalLahirTo);
    }
  }

  // Relation filters - suku
  if (query.idSuku) {
    where.idSuku = Array.isArray(query.idSuku) ? { in: query.idSuku } : query.idSuku;
  }

  // Relation filters - pendidikan
  if (query.idPendidikan) {
    where.idPendidikan = Array.isArray(query.idPendidikan) ? { in: query.idPendidikan } : query.idPendidikan;
  }

  // Relation filters - pekerjaan
  if (query.idPekerjaan) {
    where.idPekerjaan = Array.isArray(query.idPekerjaan) ? { in: query.idPekerjaan } : query.idPekerjaan;
  }

  // Relation filters - pendapatan
  if (query.idPendapatan) {
    where.idPendapatan = Array.isArray(query.idPendapatan) ? { in: query.idPendapatan } : query.idPendapatan;
  }

  // Relation filters - jaminan kesehatan
  if (query.idJaminanKesehatan) {
    where.idJaminanKesehatan = Array.isArray(query.idJaminanKesehatan) ? { in: query.idJaminanKesehatan } : query.idJaminanKesehatan;
  }

  // Relation filters - status dalam keluarga
  if (query.idStatusDalamKeluarga) {
    where.idStatusDalamKeluarga = Array.isArray(query.idStatusDalamKeluarga) ? { in: query.idStatusDalamKeluarga } : query.idStatusDalamKeluarga;
  }

  // Keluarga related filters
  if (query.idKeluarga) {
    where.idKeluarga = Array.isArray(query.idKeluarga) ? { in: query.idKeluarga } : query.idKeluarga;
  }

  if (query.idRayon) {
    where.keluarga = {
      idRayon: Array.isArray(query.idRayon) ? { in: query.idRayon } : query.idRayon
    };
  }

  if (query.idStatusKeluarga) {
    where.keluarga = {
      ...where.keluarga,
      idStatusKeluarga: Array.isArray(query.idStatusKeluarga) ? { in: query.idStatusKeluarga } : query.idStatusKeluarga
    };
  }

  if (query.idKeadaanRumah) {
    where.keluarga = {
      ...where.keluarga,
      idKeadaanRumah: Array.isArray(query.idKeadaanRumah) ? { in: query.idKeadaanRumah } : query.idKeadaanRumah
    };
  }

  if (query.idStatusKepemilikanRumah) {
    where.keluarga = {
      ...where.keluarga,
      idStatusKepemilikanRumah: Array.isArray(query.idStatusKepemilikanRumah) ? { in: query.idStatusKepemilikanRumah } : query.idStatusKepemilikanRumah
    };
  }

  // Alamat related filters
  if (query.idKelurahan || query.rt || query.rw) {
    where.keluarga = {
      ...where.keluarga,
      alamat: {}
    };

    if (query.idKelurahan) {
      where.keluarga.alamat.idKelurahan = Array.isArray(query.idKelurahan) ? { in: query.idKelurahan } : query.idKelurahan;
    }

    if (query.rt) {
      where.keluarga.alamat.rt = parseInt(query.rt);
    }

    if (query.rw) {
      where.keluarga.alamat.rw = parseInt(query.rw);
    }
  }

  // User account status filter
  if (query.hasUserAccount !== undefined) {
    if (query.hasUserAccount === "true") {
      where.User = { isNot: null };
    } else if (query.hasUserAccount === "false") {
      where.User = null;
    }
  }

  // User role filter
  if (query.userRole) {
    where.User = {
      ...where.User,
      role: Array.isArray(query.userRole) ? { in: query.userRole } : query.userRole
    };
  }

  // Age range filter (computed from tanggalLahir)
  if (query.ageMin || query.ageMax) {
    const today = new Date();
    const currentYear = today.getFullYear();

    if (!where.tanggalLahir) where.tanggalLahir = {};

    if (query.ageMax) {
      // For maximum age, calculate the earliest birth date
      const minBirthYear = currentYear - parseInt(query.ageMax);
      where.tanggalLahir.gte = new Date(`${minBirthYear}-01-01`);
    }

    if (query.ageMin) {
      // For minimum age, calculate the latest birth date
      const maxBirthYear = currentYear - parseInt(query.ageMin);
      where.tanggalLahir.lte = new Date(`${maxBirthYear}-12-31`);
    }
  }

  return where;
}
