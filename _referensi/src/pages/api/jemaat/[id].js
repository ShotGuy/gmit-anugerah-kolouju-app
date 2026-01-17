import { createApiHandler } from "@/lib/apiHandler";
import { apiResponse } from "@/lib/apiHelper";
import { processDateFields } from "@/lib/dateUtils";
import prisma from "@/lib/prisma";

async function handleGet(req, res) {
  try {
    const { id } = req.query;

    const jemaat = await prisma.jemaat.findUnique({
      where: { id: id },
      include: {
        keluarga: {
          include: {
            alamat: {
              include: {
                kelurahan: {
                  include: {
                    kecamatan: {
                      include: {
                        kotaKab: {
                          include: {
                            provinsi: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            statusKeluarga: true,
            statusKepemilikanRumah: true,
            keadaanRumah: true,
            rayon: true,
          },
        },
        statusDalamKeluarga: true,
        suku: true,
        pendidikan: true,
        pekerjaan: true,
        pendapatan: true,
        jaminanKesehatan: true,
        User: true,
      },
    });

    if (!jemaat) {
      return res
        .status(404)
        .json(apiResponse(false, null, "Data jemaat tidak ditemukan"));
    }

    return res
      .status(200)
      .json(apiResponse(true, jemaat, "Data berhasil diambil"));
  } catch (error) {
    console.error("Error fetching jemaat:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal mengambil data jemaat", error.message)
      );
  }
}

async function handlePatch(req, res) {
  try {
    const { id } = req.query;
    const requestData = req.body;

    // Check if this is a complex update (includes related entities)
    const {
      updateUser,
      updateKeluarga,
      updateAlamat,
      email,
      role,
      keluargaData,
      alamatData,
      ...jemaatFields
    } = requestData;

    if (updateUser || updateKeluarga || updateAlamat) {
      // Handle complex update with transaction - increased timeout for complex operations
      const result = await prisma.$transaction(
        async (tx) => {
          // Extract only valid Jemaat fields
          const {
            nama,
            jenisKelamin,
            tanggalLahir,
            golonganDarah,
            idKeluarga,
            idStatusDalamKeluarga,
            idSuku,
            idPendidikan,
            idPekerjaan,
            idPendapatan,
            idJaminanKesehatan,
            idPernikahan,
            status,
          } = jemaatFields;

          // Create data object with only valid jemaat fields
          const jemaatUpdateData = {
            ...(nama !== undefined && { nama }),
            ...(jenisKelamin !== undefined && {
              jenisKelamin:
                jenisKelamin === true ||
                jenisKelamin === "true" ||
                jenisKelamin === 1,
            }),
            ...(tanggalLahir !== undefined && { tanggalLahir }),
            ...(golonganDarah !== undefined && { golonganDarah }),
            ...(idStatusDalamKeluarga !== undefined && {
              idStatusDalamKeluarga,
            }),
            ...(idSuku !== undefined && { idSuku }),
            ...(idPendidikan !== undefined && { idPendidikan }),
            ...(idPekerjaan !== undefined && { idPekerjaan }),
            ...(idPendapatan !== undefined && { idPendapatan }),
            ...(idJaminanKesehatan !== undefined && { idJaminanKesehatan }),
            ...(idPernikahan !== undefined && { idPernikahan }),
            ...(status !== undefined && { status }),
          };

          // Process date fields
          const processedJemaatData = processDateFields(jemaatUpdateData, [
            "tanggalLahir",
          ]);

          // Get current jemaat data once for efficiency
          let currentJemaat = null;
          if (updateAlamat || updateKeluarga) {
            currentJemaat = await tx.jemaat.findUnique({
              where: { id },
              include: { keluarga: true },
            });
          }

          // 1. Update Alamat if requested
          if (updateAlamat && alamatData && currentJemaat?.keluarga?.idAlamat) {
            await tx.alamat.update({
              where: { id: currentJemaat.keluarga.idAlamat },
              data: alamatData,
            });
          }

          // 2. Update Keluarga if requested
          if (updateKeluarga && keluargaData && currentJemaat?.idKeluarga) {
            await tx.keluarga.update({
              where: { id: currentJemaat.idKeluarga },
              data: keluargaData,
            });
          }

          // 3. Update Jemaat
          const updatedJemaat = await tx.jemaat.update({
            where: { id },
            data: processedJemaatData,
            include: {
              keluarga: {
                include: {
                  alamat: {
                    include: {
                      kelurahan: true,
                    },
                  },
                  statusKeluarga: true,
                  rayon: true,
                },
              },
              statusDalamKeluarga: true,
              suku: true,
              pendidikan: true,
              pekerjaan: true,
              pendapatan: true,
              jaminanKesehatan: true,
              User: true,
            },
          });

          // 4. Update User if requested
          if (updateUser && updatedJemaat.User) {
            const userUpdateData = {
              ...(email !== undefined && { email }),
              ...(role !== undefined && { role }),
            };

            if (Object.keys(userUpdateData).length > 0) {
              await tx.user.update({
                where: { id: updatedJemaat.User.id },
                data: userUpdateData,
              });
            }
          }

          return updatedJemaat;
        },
        {
          timeout: 20000, // 20 seconds timeout for complex operations
          maxWait: 25000, // Maximum time to wait for a connection from the pool
        }
      );

      return res
        .status(200)
        .json(apiResponse(true, result, "Data jemaat berhasil diperbarui"));
    } else {
      // Simple jemaat-only update
      // Extract only valid Jemaat fields from the request
      const {
        nama,
        jenisKelamin,
        tanggalLahir,
        golonganDarah,
        idKeluarga,
        idStatusDalamKeluarga,
        idSuku,
        idPendidikan,
        idPekerjaan,
        idPendapatan,
        idJaminanKesehatan,
        idPernikahan,
        status,
      } = jemaatFields;

      // Create data object with only valid fields
      const jemaatData = {
        ...(nama !== undefined && { nama }),
        ...(jenisKelamin !== undefined && {
          jenisKelamin:
            jenisKelamin === true ||
            jenisKelamin === "true" ||
            jenisKelamin === 1,
        }),
        ...(tanggalLahir !== undefined && { tanggalLahir }),
        ...(golonganDarah !== undefined && { golonganDarah }),
        ...(idKeluarga !== undefined && { idKeluarga }),
        ...(idStatusDalamKeluarga !== undefined && { idStatusDalamKeluarga }),
        ...(idSuku !== undefined && { idSuku }),
        ...(idPendidikan !== undefined && { idPendidikan }),
        ...(idPekerjaan !== undefined && { idPekerjaan }),
        ...(idPendapatan !== undefined && { idPendapatan }),
        ...(idJaminanKesehatan !== undefined && { idJaminanKesehatan }),
        ...(idPernikahan !== undefined && { idPernikahan }),
        ...(status !== undefined && { status }),
      };

      // Process date fields
      const data = processDateFields(jemaatData, ["tanggalLahir"]);

      const updatedJemaat = await prisma.jemaat.update({
        where: { id: id },
        data,
        include: {
          keluarga: {
            include: {
              alamat: {
                include: {
                  kelurahan: true,
                },
              },
              statusKeluarga: true,
              rayon: true,
            },
          },
          statusDalamKeluarga: true,
          suku: true,
          pendidikan: true,
          pekerjaan: true,
          pendapatan: true,
          jaminanKesehatan: true,
        },
      });

      return res
        .status(200)
        .json(
          apiResponse(true, updatedJemaat, "Data jemaat berhasil diperbarui")
        );
    }
  } catch (error) {
    console.error("Error updating jemaat:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal memperbarui data jemaat", error.message)
      );
  }
}

async function handleDelete(req, res) {
  try {
    const { id } = req.query;

    // Check if jemaat has a user account
    const userCount = await prisma.user.count({
      where: { idJemaat: id },
    });

    if (userCount > 0) {
      return res
        .status(409)
        .json(
          apiResponse(
            false,
            null,
            "Data tidak dapat dihapus",
            "Jemaat ini memiliki akun user. Hapus akun user terlebih dahulu"
          )
        );
    }

    const deletedJemaat = await prisma.jemaat.delete({
      where: { id: id },
    });

    return res
      .status(200)
      .json(apiResponse(true, deletedJemaat, "Data berhasil dihapus"));
  } catch (error) {
    console.error("Error deleting jemaat:", error);

    return res
      .status(500)
      .json(
        apiResponse(false, null, "Gagal menghapus data jemaat", error.message)
      );
  }
}

export default createApiHandler({
  GET: handleGet,
  PATCH: handlePatch,
  DELETE: handleDelete,
});
