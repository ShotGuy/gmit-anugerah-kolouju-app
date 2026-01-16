import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, MapPin, Briefcase, GraduationCap, Heart, Droplets, BookOpen, Scroll } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";

interface DetailJemaatPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function DetailJemaatPage({ params }: DetailJemaatPageProps) {
    const { id } = await params;
    const idJemaat = decodeURIComponent(id);

    const jemaat = await prisma.jemaat.findUnique({
        where: { idJemaat },
        include: {
            status: true,
            pendidikan: true,
            pekerjaan: true,
            pendapatan: true,
            jaminan: true,
            pernikahan: true,
            baptisRecord: {
                include: {
                    klasis: true,
                },
            },
            sidiRecord: {
                include: {
                    klasis: true,
                },
            },
            keluarga: {
                include: {
                    rayon: true,
                    jemaat: true,
                    alamat: {
                        include: {
                            kelurahan: {
                                include: {
                                    kecamatan: true,
                                }
                            }
                        }
                    }
                }
            },
            jabatanRel: {
                include: {
                    jabatan: true,
                },
                orderBy: {
                    tanggalMulai: 'desc'
                }
            },
        },
    });

    if (!jemaat) {
        notFound();
    }

    const kepalaKeluarga = jemaat.keluarga.jemaat?.find((j: any) => j.status?.status.toLowerCase().includes("kepala"));

    return (
        <div className="space-y-6">
            {/* Header Navigation */}
            <div className="flex items-center gap-4">
                <Link href="/jemaat">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Detail Jemaat</h2>
                    <p className="text-muted-foreground">
                        {jemaat.nama} ({jemaat.idJemaat})
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Kolom Kiri: Profil Utama */}
                <div className="space-y-6 md:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profil Utama</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                                <User className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg">{jemaat.nama}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{jemaat.status?.status ?? "-"}</p>

                            <div className="w-full space-y-3 text-sm text-left">
                                <Separator />
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Jenis Kelamin</span>
                                    <span>{jemaat.jenisKelamin ? "Laki-laki" : "Perempuan"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Gol. Darah</span>
                                    <span>{jemaat.golDarah ?? "-"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tgl Lahir</span>
                                    <span>{new Date(jemaat.tanggalLahir).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Kontak & Alamat</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="font-medium">Rayon {jemaat.keluarga?.rayon?.namaRayon ?? "-"}</p>
                                    <p className="text-muted-foreground mt-1">
                                        {jemaat.keluarga?.alamat.jalan}, RT {jemaat.keluarga?.alamat.RT}/RW {jemaat.keluarga?.alamat.RW}
                                    </p>
                                    <p className="text-muted-foreground">
                                        Kel. {jemaat.keluarga?.alamat.kelurahan?.nama}, Kec. {jemaat.keluarga?.alamat.kelurahan?.kecamatan?.nama}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Kolom Kanan: Detail Lainnya */}
                <div className="space-y-6 md:col-span-2">

                    {/* Informasi Sosial Ekonomi */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Sosial & Ekonomi</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                    <GraduationCap className="h-5 w-5 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Pendidikan</p>
                                        <p className="font-medium">{jemaat.pendidikan?.jenjang ?? "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                    <Briefcase className="h-5 w-5 text-amber-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Pekerjaan</p>
                                        <p className="font-medium">{jemaat.pekerjaan?.namaPekerjaan ?? "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                    <div className="h-5 w-5 flex items-center justify-center font-bold text-green-600">$</div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Pendapatan</p>
                                        <p className="font-medium">{jemaat.pendapatan?.rentang ?? "-"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 rounded-lg border p-3">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Jaminan Kesehatan</p>
                                        <p className="font-medium">{jemaat.jaminan?.jenisJaminan ?? "-"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Gerejawi (Sakramen) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Gerejawi</CardTitle>
                            <CardDescription>Riwayat sakramen yang diterima.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid sm:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-2 rounded-lg border p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Droplets className="h-4 w-4 text-blue-600" />
                                        <span className="font-semibold text-sm">Baptis</span>
                                    </div>
                                    {jemaat.baptisRecord ? (
                                        <div className="text-xs space-y-1">
                                            <p><span className="text-muted-foreground">Tgl:</span> {new Date(jemaat.baptisRecord.tanggal).toLocaleDateString("id-ID")}</p>
                                            <p><span className="text-muted-foreground">Klasis:</span> {jemaat.baptisRecord.klasis.nama}</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">Belum dibaptis</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 rounded-lg border p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <BookOpen className="h-4 w-4 text-purple-600" />
                                        <span className="font-semibold text-sm">Sidi</span>
                                    </div>
                                    {jemaat.sidiRecord ? (
                                        <div className="text-xs space-y-1">
                                            <p><span className="text-muted-foreground">Tgl:</span> {new Date(jemaat.sidiRecord.tanggal).toLocaleDateString("id-ID")}</p>
                                            <p><span className="text-muted-foreground">Klasis:</span> {jemaat.sidiRecord.klasis.nama}</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">Belum sidi</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 rounded-lg border p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Heart className="h-4 w-4 text-pink-600" />
                                        <span className="font-semibold text-sm">Pernikahan</span>
                                    </div>
                                    {jemaat.pernikahan ? (
                                        <div className="text-xs space-y-1">
                                            <p><span className="text-muted-foreground">Tgl:</span> {new Date(jemaat.pernikahan.tanggal).toLocaleDateString("id-ID")}</p>
                                            <p><span className="text-muted-foreground">Klasis:</span> {jemaat.pernikahan.klasis}</p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground italic">Belum menikah / Data tidak ada</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Riwayat Jabatan */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Scroll className="h-5 w-5" />
                                <CardTitle>Riwayat Jabatan</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Jabatan</TableHead>
                                        <TableHead>Mulai</TableHead>
                                        <TableHead>Berakhir</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {jemaat.jabatanRel.length > 0 ? (
                                        jemaat.jabatanRel.map((rel) => (
                                            <TableRow key={`${rel.idJabatan}-${rel.tanggalMulai}`}>
                                                <TableCell className="font-medium">{rel.jabatan.namaJabatan}</TableCell>
                                                <TableCell>{new Date(rel.tanggalMulai).toLocaleDateString("id-ID")}</TableCell>
                                                <TableCell>
                                                    {rel.tanggalBerakhir
                                                        ? new Date(rel.tanggalBerakhir).toLocaleDateString("id-ID")
                                                        : "-"
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {rel.statusAktif ? (
                                                        <Badge variant="outline" className="border-green-500 text-green-500">Aktif</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-muted-foreground">Non-Aktif</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                                                Tidak ada riwayat jabatan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
