import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DetailKeluargaPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function DetailKeluargaPage({ params }: DetailKeluargaPageProps) {
    const { id } = await params;
    // Decode ID if needed (though Next.js params usually come decoded or ready to use) - handling slashes
    const idKeluarga = decodeURIComponent(id);

    const keluarga = await prisma.keluarga.findUnique({
        where: { idKeluarga },
        include: {
            rayon: true,
            statusKepemilikan: true,
            statusTanah: true,
            jemaat: {
                include: {
                    status: true,
                    pendidikan: true,
                    pekerjaan: true,
                },
            },
            alamat: {
                include: {
                    kelurahan: {
                        include: {
                            kecamatan: true,
                        },
                    },
                },
            },
        },
    });

    if (!keluarga) {
        notFound();
    }

    const kepalaKeluarga = keluarga.jemaat.find((j) => j.status?.status.toLowerCase().includes("kepala"));

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/keluarga">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Detail Keluarga</h2>
                    <p className="text-muted-foreground">
                        {keluarga.idKeluarga} - {kepalaKeluarga?.nama ?? "Tanpa Kepala Keluarga"}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Keluarga</CardTitle>
                        <CardDescription>Data utama keluarga dan alamat.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="font-medium text-muted-foreground">No KK</p>
                                <p>{keluarga.idKeluarga}</p>
                            </div>
                            <div>
                                <p className="font-medium text-muted-foreground">Rayon</p>
                                <p>{keluarga.rayon?.namaRayon ?? "-"}</p>
                            </div>
                            <div>
                                <p className="font-medium text-muted-foreground">Status Rumah</p>
                                <p>{keluarga.statusKepemilikan?.status ?? "-"}</p>
                            </div>
                            <div>
                                <p className="font-medium text-muted-foreground">Status Tanah</p>
                                <p>{keluarga.statusTanah?.status ?? "-"}</p>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <p className="font-medium text-muted-foreground mb-2">Alamat Lengkap</p>
                            <p>
                                {keluarga.alamat.jalan}, RT {keluarga.alamat.RT}/RW {keluarga.alamat.RW}
                            </p>
                            <p>
                                Kel. {keluarga.alamat.kelurahan?.nama ?? "-"}, Kec. {keluarga.alamat.kelurahan?.kecamatan?.nama ?? "-"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Statistik Anggota</CardTitle>
                        <CardDescription>Ringkasan jumlah anggota keluarga.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center justify-center rounded-lg border p-4 bg-muted/50">
                                <User className="h-8 w-8 text-primary mb-2" />
                                <span className="text-2xl font-bold">{keluarga.jemaat.length}</span>
                                <span className="text-xs text-muted-foreground">Total Jiwa</span>
                            </div>
                            <div className="flex flex-col items-center justify-center rounded-lg border p-4 bg-muted/50">
                                <span className="text-sm font-medium mb-2">Dokumen Pendukung</span>
                                {(keluarga as any).fotoKartuKeluarga ? (
                                    <div className="flex flex-col items-center">
                                        <a
                                            href={(keluarga as any).fotoKartuKeluarga}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline text-sm font-semibold flex items-center gap-1"
                                        >
                                            🔍 Lihat Kartu Keluarga
                                        </a>
                                        <span className="text-[10px] text-green-600 font-medium mt-1">✔ Lampiran Lengkap</span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-destructive font-medium">❌ Belum upload KK</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Anggota Keluarga</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama Lengkap</TableHead>
                                <TableHead>NIK</TableHead>
                                <TableHead>L/P</TableHead>
                                <TableHead>Status Hubungan</TableHead>
                                <TableHead>Tgl Lahir</TableHead>
                                <TableHead>Pendidikan</TableHead>
                                <TableHead>Pekerjaan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {keluarga.jemaat.map((anggota) => (
                                <TableRow key={anggota.idJemaat}>
                                    <TableCell className="font-medium">
                                        {anggota.nama}
                                        {anggota.status?.status.toLowerCase().includes("kepala") && (
                                            <Badge variant="secondary" className="ml-2 text-[10px]">Kepala</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{anggota.idJemaat}</TableCell>
                                    <TableCell>{anggota.jenisKelamin ? "Laki-laki" : "Perempuan"}</TableCell>
                                    <TableCell>{anggota.status?.status ?? "-"}</TableCell>
                                    <TableCell>{new Date(anggota.tanggalLahir).toLocaleDateString("id-ID")}</TableCell>
                                    <TableCell>{anggota.pendidikan?.jenjang ?? "-"}</TableCell>
                                    <TableCell>{anggota.pekerjaan?.namaPekerjaan ?? "-"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
