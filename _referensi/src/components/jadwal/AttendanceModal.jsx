import { Dialog, Transition } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { X } from 'lucide-react';
import { Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

export default function AttendanceModal({ isOpen, onClose, jadwal }) {
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            jumlahLaki: 0,
            jumlahPerempuan: 0,
            targetPeserta: 0,
        },
    });

    // Load existing data when modal opens
    useEffect(() => {
        if (jadwal) {
            setValue('jumlahLaki', jadwal.jumlahLaki || 0);
            setValue('jumlahPerempuan', jadwal.jumlahPerempuan || 0);
            setValue('targetPeserta', jadwal.targetPeserta || 0);
        }
    }, [jadwal, setValue, isOpen]);

    const jumlahLaki = watch('jumlahLaki') || 0;
    const jumlahPerempuan = watch('jumlahPerempuan') || 0;
    const totalHadir = parseInt(jumlahLaki) + parseInt(jumlahPerempuan);

    const mutation = useMutation({
        mutationFn: async (data) => {
            // Send PATCH request to update only attendance fields
            const response = await axios.patch(`/api/jadwal-ibadah/${jadwal.id}`, {
                jumlahLaki: parseInt(data.jumlahLaki),
                jumlahPerempuan: parseInt(data.jumlahPerempuan),
                // targetPeserta: parseInt(data.targetPeserta), // Optional, uncomment if you want to allow updating target here
            });
            return response.data;
        },
        onSuccess: () => {
            toast.success('Data kehadiran berhasil disimpan!');
            queryClient.invalidateQueries(['jadwal-ibadah']); // Refresh list
            onClose();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data');
        },
    });

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all border border-gray-100">
                                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                    <div>
                                        <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 font-display">
                                            Lapor Kehadiran
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {jadwal?.judul} - {new Date(jadwal?.tanggal).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                                        <X className="w-5 h-5 text-gray-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Input Pria */}
                                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            <label className="block text-sm font-semibold text-blue-900 mb-2">
                                                Jemaat Pria
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                {...register('jumlahLaki')}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-2xl font-bold text-center text-blue-700 h-14"
                                            />
                                        </div>

                                        {/* Input Wanita */}
                                        <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                                            <label className="block text-sm font-semibold text-pink-900 mb-2">
                                                Jemaat Wanita
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                {...register('jumlahPerempuan')}
                                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-2xl font-bold text-center text-pink-700 h-14"
                                            />
                                        </div>
                                    </div>

                                    {/* Total Count - Auto Calculated */}
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                                        <p className="text-sm text-gray-500 font-medium">Total Kehadiran</p>
                                        <p className="text-4xl font-black text-gray-800 font-display mt-1">
                                            {totalHadir}
                                            <span className="text-base font-normal text-gray-400 ml-2">Jiwa</span>
                                        </p>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
