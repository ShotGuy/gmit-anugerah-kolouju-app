import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, RefreshCw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';

export default function StatisticsFilterBar({ filters, setFilters, onRefresh }) {
    // Fetch Filter Options (Jenis Ibadah & Rayon)
    const { data: filterOptions } = useQuery({
        queryKey: ['filterOptions'],
        queryFn: async () => {
            const [jenisRes, rayonRes, kategoriRes] = await Promise.all([
                axios.get('/api/master/jenis-ibadah'), // Assuming these master APIs exist
                axios.get('/api/master/rayon'),
                axios.get('/api/master/kategori-jadwal')
            ]);
            return {
                jenisIbadah: jenisRes.data.data.map(j => ({ value: j.id, label: j.namaIbadah })),
                rayon: rayonRes.data.data.map(r => ({ value: r.id, label: r.namaRayon })),
                kategori: kategoriRes.data.data.map(k => ({ value: k.id, label: k.namaKategori }))
            };
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const customSelectStyles = {
        control: (base) => ({
            ...base,
            borderColor: '#e5e7eb',
            borderRadius: '0.5rem',
            padding: '2px',
            fontSize: '0.875rem',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#d1d5db'
            }
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected ? '#eff6ff' : state.isFocused ? '#f9fafb' : 'white',
            color: state.isSelected ? '#1d4ed8' : '#374151',
            fontSize: '0.875rem',
        })
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4 md:space-y-0 md:flex md:items-end md:gap-4 mb-6">

            {/* Date Range Picker */}
            <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Dari Tanggal</label>
                    <div className="relative">
                        <DatePicker
                            selected={filters.startDate}
                            onChange={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                            dateFormat="dd MMM yyyy"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Sampai Tanggal</label>
                    <div className="relative">
                        <DatePicker
                            selected={filters.endDate}
                            onChange={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                            dateFormat="dd MMM yyyy"
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                </div>
            </div>

            {/* Filters Dropdown */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Jenis Ibadah</label>
                    <Select
                        options={filterOptions?.jenisIbadah}
                        isClearable
                        placeholder="Semua Jenis"
                        styles={customSelectStyles}
                        onChange={(opt) => setFilters(prev => ({ ...prev, idJenisIbadah: opt?.value || null }))}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Kategori</label>
                    <Select
                        options={filterOptions?.kategori}
                        isClearable
                        placeholder="Semua Kategori"
                        styles={customSelectStyles}
                        onChange={(opt) => setFilters(prev => ({ ...prev, idKategori: opt?.value || null }))}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Rayon</label>
                    <Select
                        options={filterOptions?.rayon}
                        isClearable
                        placeholder="Semua Rayon"
                        styles={customSelectStyles}
                        onChange={(opt) => setFilters(prev => ({ ...prev, idRayon: opt?.value || null }))}
                    />
                </div>
            </div>

            {/* Refresh Button */}
            <div>
                <button
                    onClick={onRefresh}
                    className="w-full md:w-auto px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden md:inline">Refresh</span>
                </button>
            </div>
        </div>
    );
}
