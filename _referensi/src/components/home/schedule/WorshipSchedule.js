import { useEffect, useState } from "react";
import publicJadwalService from "../../../services/publicJadwalService";
import ScheduleCard from "./scheduleCard";

export default function WorshipSchedule() {
    const [sundaySchedules, setSundaySchedules] = useState([]);
    const [familySchedules, setFamilySchedules] = useState([]);
    const [dailySchedules, setDailySchedules] = useState([]); // Cell/Pemuda etc
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllSchedules = async () => {
            try {
                setLoading(true);

                // Fetch Parallel: Sunday, Family, Others
                const [sundayData, familyData, dailyData] = await Promise.all([
                    publicJadwalService.getJadwalIbadah({ jenisIbadah: "Minggu", limit: 3, upcoming: true }),
                    publicJadwalService.getJadwalIbadah({ kategori: "Keluarga", limit: 4, upcoming: true }),
                    publicJadwalService.getJadwalIbadah({ jenisIbadah: "Cell Group/Kelompok Kecil", limit: 4, upcoming: true })
                ]);

                setSundaySchedules(publicJadwalService.formatForScheduleRow(sundayData));
                setFamilySchedules(publicJadwalService.formatForScheduleRow(familyData));
                setDailySchedules(publicJadwalService.formatForScheduleRow(dailyData));

            } catch (err) {
                console.error("Failed to load schedules", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAllSchedules();
    }, []);

    if (loading) return null; // Or subtle skeleton

    // Combine Family & Daily for the Grid
    const secondarySchedules = [...familySchedules, ...dailySchedules].slice(0, 6);

    return (
        <div className="py-20 lg:py-28 bg-white dark:bg-gray-950 transition-colors duration-500 relative">
            {/* Background Decoration */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/50" />

            <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">

                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block h-1 w-20 bg-amber-500 rounded-full mb-6"></span>
                    <h2 className="font-serif text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        Jadwal Peribadahan
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg font-light">
                        Mari bergabung dalam persekutuan dan memuji nama Tuhan bersama-sama.
                    </p>
                </div>

                {/* Sunday Service - The Pillars */}
                {sundaySchedules.length > 0 && (
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-8">
                            <h3 className="font-serif text-2xl font-bold text-gray-800 dark:text-white">Ibadah Minggu</h3>
                            <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {sundaySchedules.map((schedule, index) => (
                                <ScrollAnimation key={schedule.id} delay={index * 100} className="h-full" variant="fade-up">
                                    <ScheduleCard {...schedule} category="sunday" />
                                </ScrollAnimation>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weekday/Family Services - The Community */}
                {(secondarySchedules.length > 0) && (
                    <div>
                        <div className="flex items-center gap-4 mb-8">
                            <h3 className="font-serif text-2xl font-bold text-gray-800 dark:text-white">Ibadah Keluarga & Kelompok</h3>
                            <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {secondarySchedules.map((schedule, index) => (
                                <ScrollAnimation key={schedule.id} delay={index * 50} className="h-full" variant="fade-up">
                                    <ScheduleCard {...schedule} category="family" />
                                </ScrollAnimation>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
