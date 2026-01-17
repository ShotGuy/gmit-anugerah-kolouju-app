import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { ArrowLeft } from 'lucide-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

import AttendanceChart from '@/components/jadwal/AttendanceChart';
import StatisticsFilterBar from '@/components/jadwal/StatisticsFilterBar';
import { Button } from '@/components/ui/Button';

export default function StatistikKehadiranPage() {
    const router = useRouter();

    // Default Filter: Current Month
    const [filters, setFilters] = useState({
        startDate: startOfMonth(new Date()),
        endDate: endOfMonth(new Date()),
        idJenisIbadah: null,
        idKategori: null,
        idRayon: null,
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['statistik-kehadiran', filters],
        queryFn: async () => {
            // Format dates to YYYY-MM-DD for API
            const params = {
                startDate: format(filters.startDate, 'yyyy-MM-dd'),
                endDate: format(filters.endDate, 'yyyy-MM-dd'),
            };
            if (filters.idJenisIbadah) params.idJenisIbadah = filters.idJenisIbadah;
            if (filters.idKategori) params.idKategori = filters.idKategori;
            if (filters.idRayon) params.idRayon = filters.idRayon;

            const res = await axios.get('/api/statistik/kehadiran', { params });
            return res.data.data;
        },
        keepPreviousData: true,
    });

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Head>
                <title>Statistik Kehadiran | GMIT Admin</title>
            </Head>

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4 mb-2">
                        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-gray-500">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
                        </Button>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 font-display">Statistik Kehadiran & Partisipasi</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Analisis data kehadiran jemaat, tren ibadah, dan distribusi partisipasi per sektor.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Filters */}
                <StatisticsFilterBar
                    filters={filters}
                    setFilters={setFilters}
                    onRefresh={refetch}
                />

                {/* Charts */}
                <AttendanceChart data={data} loading={isLoading} />
            </div>
        </div>
    );
}
