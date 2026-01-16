import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { pdf, Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Types
export type ExportColumn<T = any> = {
    header: string;
    accessorKey: keyof T | string;
    cell?: (item: T) => string | number | null | undefined;
};

// --- EXCEL GENERATOR ---
export async function exportToExcel<T>(
    data: T[],
    columns: ExportColumn<T>[],
    filename: string,
    sheetName: string = "Data"
) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Define Columns
    worksheet.columns = columns.map((col) => ({
        header: col.header,
        key: col.accessorKey as string,
        width: 25, // Default width
    }));

    // Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF2563EB" }, // Primary Blue
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 30;

    // Add Data
    data.forEach((item) => {
        const rowData: Record<string, any> = {};
        columns.forEach((col) => {
            let value = (item as any)[col.accessorKey];
            if (col.cell) {
                value = col.cell(item);
            }
            rowData[col.accessorKey as string] = value;
        });
        worksheet.addRow(rowData);
    });

    // Style Data Rows (stripes)
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            if (rowNumber % 2 === 0) {
                row.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFF3F4F6" }, // Gray-100
                };
            }
            row.getCell(1).alignment = { horizontal: "center" }; // Center first column usually
        }
    });

    // Generate Buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `${filename}.xlsx`);
}

// --- PDF GENERATOR ---

// Register font (Optional, standard fonts usually fine but for specific consistency we can use defaults)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/Roboto-Regular.ttf' });

const styles = StyleSheet.create({
    page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
    header: { marginBottom: 20, textAlign: 'center' },
    title: { fontSize: 18, marginBottom: 5, fontWeight: 'bold' },
    subtitle: { fontSize: 12, color: 'gray' },
    table: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', borderRightWidth: 0, borderBottomWidth: 0 },
    tableRow: { margin: "auto", flexDirection: "row" },
    tableColHeader: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', borderLeftWidth: 0, borderTopWidth: 0, backgroundColor: '#f0f0f0' },
    tableCol: { width: "100%", borderStyle: "solid", borderWidth: 1, borderColor: '#bfbfbf', borderLeftWidth: 0, borderTopWidth: 0 },
    tableCellHeader: { margin: 5, fontSize: 10, fontWeight: 'bold' },
    tableCell: { margin: 5, fontSize: 9 },
});

const PdfDocument = <T,>({ data, columns, title, subtitle }: { data: T[]; columns: ExportColumn<T>[]; title: string; subtitle?: string }) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                <Text style={styles.subtitle}>Dicetak pada: {format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}</Text>
            </View>

            <View style={styles.table}>
                {/* Table Header */}
                <View style={styles.tableRow}>
                    {columns.map((col, i) => (
                        <View key={i} style={{ ...styles.tableColHeader, width: `${100 / columns.length}%` }}>
                            <Text style={styles.tableCellHeader}>{col.header}</Text>
                        </View>
                    ))}
                </View>

                {/* Table Body */}
                {data.map((item, rowIndex) => (
                    <View key={rowIndex} style={styles.tableRow}>
                        {columns.map((col, colIndex) => {
                            let value = (item as any)[col.accessorKey];
                            if (col.cell) {
                                value = col.cell(item);
                            }
                            // Serialize if object/boolean
                            if (typeof value === 'boolean') value = value ? "Ya" : "Tidak";
                            if (value === null || value === undefined) value = "-";

                            return (
                                <View key={colIndex} style={{ ...styles.tableCol, width: `${100 / columns.length}%` }}>
                                    <Text style={styles.tableCell}>{String(value)}</Text>
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>
        </Page>
    </Document>
);

export async function exportToPdf<T>(
    data: T[],
    columns: ExportColumn<T>[],
    filename: string,
    title: string
) {
    const blob = await pdf(<PdfDocument data={data} columns={columns} title={title} />).toBlob();
    saveAs(blob, `${filename}.pdf`);
}

// --- STATISTICS PDF GENERATOR ---

export interface StatisticsData {
    totalJiwa: number;
    totalKK: number;
    gender: { label: string; count: number; color: string }[];
    umur: { label: string; count: number; color: string }[];
    pekerjaan: { label: string; count: number }[];
    rayon: { label: string; count: number }[];
    baptis: { sudan: number; belum: number };
    sidi: { sudan: number; belum: number };
    // New Fields
    pendidikan: { label: string; count: number }[];
    pendapatan: { label: string; count: number }[];
    golDarah: { label: string; count: number }[];
    statusPerkawinan: { label: string; count: number }[];
    bulanLahir: { label: string; count: number }[];
}

const statsStyles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', backgroundColor: '#ffffff' },
    header: { marginBottom: 30, borderBottomWidth: 2, borderBottomColor: '#2563EB', paddingBottom: 10 },
    title: { fontSize: 24, marginBottom: 5, fontWeight: 'bold', color: '#1e293b' },
    subtitle: { fontSize: 12, color: '#64748b' },

    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#0f172a', borderLeftWidth: 4, borderLeftColor: '#2563EB', paddingLeft: 8 },

    cardContainer: { flexDirection: 'row', gap: 15, marginBottom: 20 },
    card: { flex: 1, padding: 15, backgroundColor: '#EFF6FF', borderRadius: 8, alignItems: 'center' },
    cardValue: { fontSize: 28, fontWeight: 'bold', color: '#2563EB' },
    cardLabel: { fontSize: 10, color: '#64748b', marginTop: 4, textTransform: 'uppercase' },

    row: { flexDirection: 'row', gap: 30, marginBottom: 15 },
    col: { flex: 1 },

    // Charts
    chartContainer: { marginTop: 10 },
    barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    barLabel: { width: 90, fontSize: 9, color: '#475569' },
    barTrack: { flex: 1, height: 16, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
    barValue: { marginLeft: 8, width: 30, fontSize: 9, fontWeight: 'bold', color: '#334155' },

    progressContainer: { marginBottom: 12 },
    progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    progressTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
    progressBar: { height: '100%' },

    // Grid for smaller items
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    gridItem: { width: '48%', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 4, borderLeftWidth: 2, borderLeftColor: '#CBD5E1' }
});

const PdfStatisticsDocument = ({ stats, title, subtitle }: { stats: StatisticsData; title: string; subtitle?: string }) => {
    // Helper to calculate percentage width
    const getWidth = (val: number, max: number) => {
        if (max === 0) return '0%';
        return `${(val / max) * 100}%`;
    };

    const maxAge = Math.max(...stats.umur.map(u => u.count), 1);
    const maxWork = Math.max(...stats.pekerjaan.map(p => p.count), 1);
    const maxRayon = Math.max(...stats.rayon.map(r => r.count), 1);

    // Page 2 Max Calcs
    const maxEdu = Math.max(...stats.pendidikan.map(p => p.count), 1);
    const maxIncome = Math.max(...stats.pendapatan.map(p => p.count), 1);
    const maxMonth = Math.max(...stats.bulanLahir.map(m => m.count), 1);

    return (
        <Document>
            {/* PAGE 1: DEMOGRAPHICS & SOCIAL */}
            <Page size="A4" style={statsStyles.page}>
                {/* Header */}
                <View style={statsStyles.header}>
                    <Text style={statsStyles.title}>{title}</Text>
                    {subtitle && <Text style={statsStyles.subtitle}>{subtitle}</Text>}
                    <Text style={statsStyles.subtitle}>Dicetak pada: {format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}</Text>
                </View>

                {/* Key Metrics Cards */}
                <View style={statsStyles.cardContainer}>
                    <View style={statsStyles.card}>
                        <Text style={statsStyles.cardValue}>{stats.totalJiwa}</Text>
                        <Text style={statsStyles.cardLabel}>Total Jiwa</Text>
                    </View>
                    <View style={statsStyles.card}>
                        <Text style={statsStyles.cardValue}>{stats.totalKK}</Text>
                        <Text style={statsStyles.cardLabel}>Kepala Keluarga</Text>
                    </View>
                    <View style={statsStyles.card}>
                        <Text style={statsStyles.cardValue}>
                            {((stats.gender.find(g => g.label === "Laki-laki")?.count || 0) / (stats.totalJiwa || 1) * 100).toFixed(0)}%
                        </Text>
                        <Text style={statsStyles.cardLabel}>Laki-laki</Text>
                    </View>
                </View>

                <View style={statsStyles.row}>
                    {/* Column 1: Demographics */}
                    <View style={statsStyles.col}>
                        <View style={statsStyles.section}>
                            <Text style={statsStyles.sectionTitle}>Distribusi Usia</Text>
                            <View style={statsStyles.chartContainer}>
                                {stats.umur.map((item, i) => (
                                    <View key={i} style={statsStyles.barRow}>
                                        <Text style={statsStyles.barLabel}>{item.label}</Text>
                                        <View style={statsStyles.barTrack}>
                                            <View style={{ width: getWidth(item.count, maxAge), backgroundColor: item.color, height: '100%' }} />
                                        </View>
                                        <Text style={statsStyles.barValue}>{item.count}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={statsStyles.section}>
                            <Text style={statsStyles.sectionTitle}>Kesehatan Rohani</Text>
                            <View style={statsStyles.progressContainer}>
                                <View style={statsStyles.progressLabelRow}>
                                    <Text style={{ fontSize: 9 }}>Sudah Baptis</Text>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold' }}>
                                        {((stats.baptis.sudan / (stats.totalJiwa || 1)) * 100).toFixed(1)}%
                                    </Text>
                                </View>
                                <View style={statsStyles.progressTrack}>
                                    <View style={{ width: getWidth(stats.baptis.sudan, stats.totalJiwa), backgroundColor: '#10B981', height: '100%' }} />
                                </View>
                            </View>

                            <View style={statsStyles.progressContainer}>
                                <View style={statsStyles.progressLabelRow}>
                                    <Text style={{ fontSize: 9 }}>Sudah Sidi</Text>
                                    <Text style={{ fontSize: 9, fontWeight: 'bold' }}>
                                        {((stats.sidi.sudan / (stats.totalJiwa || 1)) * 100).toFixed(1)}%
                                    </Text>
                                </View>
                                <View style={statsStyles.progressTrack}>
                                    <View style={{ width: getWidth(stats.sidi.sudan, stats.totalJiwa), backgroundColor: '#8B5CF6', height: '100%' }} />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Column 2: Job & Rayon */}
                    <View style={statsStyles.col}>
                        <View style={statsStyles.section}>
                            <Text style={statsStyles.sectionTitle}>Top 5 Pekerjaan</Text>
                            <View style={statsStyles.chartContainer}>
                                {stats.pekerjaan.map((item, i) => (
                                    <View key={i} style={statsStyles.barRow}>
                                        <Text style={statsStyles.barLabel}>{item.label}</Text>
                                        <View style={statsStyles.barTrack}>
                                            <View style={{ width: getWidth(item.count, maxWork), backgroundColor: '#64748b', height: '100%' }} />
                                        </View>
                                        <Text style={statsStyles.barValue}>{item.count}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={statsStyles.section}>
                            <Text style={statsStyles.sectionTitle}>Sebaran Rayon (Top 8)</Text>
                            <View style={statsStyles.chartContainer}>
                                {stats.rayon.slice(0, 8).map((item, i) => (
                                    <View key={i} style={statsStyles.barRow}>
                                        <Text style={statsStyles.barLabel}>{item.label}</Text>
                                        <View style={statsStyles.barTrack}>
                                            <View style={{ width: getWidth(item.count, maxRayon), backgroundColor: '#F59E0B', height: '100%' }} />
                                        </View>
                                        <Text style={statsStyles.barValue}>{item.count}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>
            </Page>

            {/* PAGE 2: ADDITIONAL METRICS */}
            <Page size="A4" style={statsStyles.page}>
                <View style={statsStyles.header}>
                    <Text style={statsStyles.title}>{title} (Lanjutan)</Text>
                    <Text style={statsStyles.subtitle}>Pendidikan, Ekonomi, dan Data Lainnya</Text>
                </View>

                <View style={statsStyles.row}>
                    {/* Col 1: Education & Income */}
                    <View style={statsStyles.col}>
                        <View style={statsStyles.section}>
                            <Text style={statsStyles.sectionTitle}>Tingkat Pendidikan</Text>
                            <View style={statsStyles.chartContainer}>
                                {stats.pendidikan.map((item, i) => (
                                    <View key={i} style={statsStyles.barRow}>
                                        <Text style={statsStyles.barLabel}>{item.label}</Text>
                                        <View style={statsStyles.barTrack}>
                                            <View style={{ width: getWidth(item.count, maxEdu), backgroundColor: '#3B82F6', height: '100%' }} />
                                        </View>
                                        <Text style={statsStyles.barValue}>{item.count}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Col 2: Income & Others */}
                    <View style={statsStyles.col}>
                        <View style={statsStyles.section}>
                            <Text style={statsStyles.sectionTitle}>Rentang Pendapatan</Text>
                            <View style={statsStyles.chartContainer}>
                                {stats.pendapatan.map((item, i) => (
                                    <View key={i} style={statsStyles.barRow}>
                                        <Text style={statsStyles.barLabel}>{item.label}</Text>
                                        <View style={statsStyles.barTrack}>
                                            <View style={{ width: getWidth(item.count, maxIncome), backgroundColor: '#10B981', height: '100%' }} />
                                        </View>
                                        <Text style={statsStyles.barValue}>{item.count}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                <View style={statsStyles.row}>
                    <View style={statsStyles.col}>
                        <View style={statsStyles.section}>
                            <Text style={statsStyles.sectionTitle}>Status Perkawinan</Text>
                            <View style={statsStyles.gridContainer}>
                                {stats.statusPerkawinan.map((item, i) => (
                                    <View key={i} style={statsStyles.gridItem}>
                                        <Text style={{ fontSize: 8, color: '#64748b' }}>{item.label}</Text>
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#334155' }}>{item.count} <Text style={{ fontSize: 8, fontWeight: 'normal' }}>jiwa</Text></Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    <View style={statsStyles.col}>
                        <View style={statsStyles.section}>
                            <Text style={statsStyles.sectionTitle}>Golongan Darah</Text>
                            <View style={statsStyles.gridContainer}>
                                {stats.golDarah.map((item, i) => (
                                    <View key={i} style={[statsStyles.gridItem, { width: '30%', borderLeftColor: '#EF4444' }]}>
                                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#EF4444' }}>{item.label || '-'}</Text>
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#334155' }}>{item.count}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                <View style={statsStyles.section}>
                    <Text style={statsStyles.sectionTitle}>Peta Ulang Tahun (Bulan)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 4, marginTop: 10, borderBottomWidth: 1, borderBottomColor: '#cbd5e1' }}>
                        {stats.bulanLahir.map((item, i) => (
                            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                                <View style={{ width: '80%', height: getWidth(item.count, maxMonth), backgroundColor: '#8B5CF6', borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
                                <Text style={{ fontSize: 8, marginTop: 4, color: '#64748b' }}>{item.label.substring(0, 3)}</Text>
                                <Text style={{ fontSize: 6, color: '#94a3b8' }}>{item.count}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </Page>
        </Document>
    );
};

export async function exportStatisticsToPdf(
    stats: StatisticsData,
    filename: string,
    title: string,
    subtitle?: string
) {
    const blob = await pdf(<PdfStatisticsDocument stats={stats} title={title} subtitle={subtitle} />).toBlob();
    saveAs(blob, `${filename}.pdf`);
}
